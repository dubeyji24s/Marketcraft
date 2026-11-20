// My Marketing Lab.
//   Partner mode — opens when a learner joins the Ambassador Program. Every tool works, but
//                  everything made must promote the partner; the Partner Guard checks it.
//   Own mode     — unlocked by the Ambassador certificate: market your OWN product/service.
// All AI work goes through the Director (cache, budget, free fallback, small-model guard).
import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { db } from '../db.js';
import { config } from '../config.js';
import { requireAuth } from '../auth.js';
import { toolCatalog, getTool, inputSchema } from '../ai/ambassadorTools.js';
import { getBrief, referralLink } from '../company.js';
import { reward, activity } from '../progress.js';
import { runCopy, guard, agentReport } from '../agents/director.js';
import { docText } from '../agents/guard.js';

const router = Router();
router.use(requireAuth);

const BRAND_FIELDS = ['name', 'website', 'tagline', 'description', 'products', 'audience', 'keyMessages', 'offers', 'voice', 'dos', 'donts', 'hashtags'];
const emptyBrand = () => Object.fromEntries(BRAND_FIELDS.map((k) => [k, '']));

function missionCertified(user) {
  const mission = db.find('challenges', (c) => c.kind === 'ambassador');
  return Boolean(mission && db.find('certificates', (c) => c.userId === user.id && c.challengeId === mission.id && c.score >= config.passThreshold));
}

/** 'own' | 'partner' | null */
export function labMode(user) {
  if (user.role === 'admin' || missionCertified(user)) return 'own';
  if (user.ambassador) return 'partner';
  return null;
}

function requireLab(req, res, next) {
  req.labMode = labMode(req.user);
  if (req.labMode) return next();
  res.status(403).json({ error: 'Join the Ambassador Program to open your Marketing Lab.' });
}
const requireOwn = (req, res, next) =>
  req.labMode === 'own' ? next() : res.status(403).json({ error: 'Your own brand unlocks with the Ambassador certificate. For now, the Lab makes content for the partner website.' });

/** The partner as seen inside the Lab (real name is used in the content learners publish). */
function partnerInfo(user) {
  const b = getBrief();
  return { displayName: b.displayName, name: b.name || b.displayName, website: b.website, description: b.description, products: b.products, hashtags: b.hashtags, keyMessages: b.keyMessages, tagline: b.tagline, audience: b.audience, referralLink: referralLink(b, user.ambassador?.code) };
}

router.get('/status', (req, res) => {
  const mode = labMode(req.user);
  const mission = db.find('challenges', (c) => c.kind === 'ambassador');
  res.json({
    unlocked: Boolean(mode),
    mode,
    joined: Boolean(req.user.ambassador),
    missionId: mission?.id ?? null,
    passThreshold: config.passThreshold,
    brand: { ...emptyBrand(), ...(req.user.lab?.brand ?? {}) },
    partner: mode === 'partner' || req.user.ambassador ? partnerInfo(req.user) : null,
    tools: toolCatalog(),
    aiEnabled: config.aiEnabled,
  });
});

const BrandSchema = z.object(
  Object.fromEntries(BRAND_FIELDS.map((k) => [k, k === 'website' ? z.string().trim().url('Website must be a full link, like https://…').or(z.literal('')) : z.string().trim().max(k === 'name' ? 80 : 2000)])),
);

router.put('/brand', requireLab, requireOwn, async (req, res) => {
  const parsed = BrandSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
  if (!parsed.data.name) return res.status(400).json({ error: 'Give your brand a name.' });
  const first = !req.user.lab?.brand?.name;
  await db.update('users', req.user.id, { lab: { ...(req.user.lab ?? {}), brand: parsed.data } });
  const newBadges = first ? await reward(db.get('users', req.user.id), { xp: 30, badges: ['lab'] }) : [];
  res.json({ brand: parsed.data, newBadges });
});

// ---- the Partner Guard as a service for the browser (exports, video, Canva) ---------------
router.post('/guard', requireLab, async (req, res) => {
  if (req.labMode !== 'partner') return res.json({ ok: true, level: 'own-mode', message: '' });
  const parsed = z.object({ kind: z.enum(['request', 'content']).default('content'), texts: z.array(z.string().max(4000)).max(60) }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Nothing to check.' });
  res.json(await guard({ ...parsed.data, brief: getBrief(), user: req.user }));
});

router.get('/agents', requireLab, (req, res) => res.json(agentReport(req.user.id)));

// ---- AI tools ------------------------------------------------------------------------------
const toolLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: (req) => (req.user?.role === 'admin' ? 200 : 40),
  keyGenerator: (req) => req.user.id,
  message: { error: 'You have used the AI tools a lot this hour. Take a break and try again soon.' },
});

router.post('/tools/:id', requireLab, toolLimiter, async (req, res, next) => {
  const tool = getTool(req.params.id);
  if (!tool) return res.status(404).json({ error: 'Tool not found.' });
  const parsed = inputSchema(tool).safeParse(req.body?.inputs ?? {});
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
  try {
    let job;
    if (req.labMode === 'partner') {
      const brief = getBrief();
      if (!brief.description) return res.status(409).json({ error: 'The partner brief has not been filled in yet. Ask an admin to complete it.' });
      const check = await guard({ kind: 'request', texts: Object.values(parsed.data), brief, user: req.user });
      if (!check.ok) return res.status(422).json({ error: check.message, guard: check });
      job = await runCopy({ tool, inputs: parsed.data, brief, user: req.user, referralLink: referralLink(brief, req.user.ambassador?.code), mode: 'ambassador' });
    } else {
      const brand = req.user.lab?.brand;
      if (!brand?.name || !brand.description) return res.status(409).json({ error: 'Fill in "My brand" first (at least the name and what it does), so the AI knows what to market.' });
      job = await runCopy({ tool, inputs: parsed.data, brief: brand, user: req.user, referralLink: brand.website, mode: 'own' });
    }
    const run = await db.insert('toolRuns', { userId: req.user.id, scope: 'lab', labMode: req.labMode, toolId: tool.id, inputs: parsed.data, output: job.output, engine: job.engine, cached: job.cached, tokens: job.tokens });
    const mine = db.all('toolRuns', (r) => r.userId === req.user.id && r.scope === 'lab').sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    for (const old of mine.slice(50)) await db.remove('toolRuns', old.id);
    res.status(201).json({ run, overBudget: job.overBudget });
  } catch (err) {
    next(err);
  }
});

router.get('/runs', requireLab, (req, res) => {
  res.json({ runs: db.all('toolRuns', (r) => r.userId === req.user.id && r.scope === 'lab').sort((a, b) => b.createdAt.localeCompare(a.createdAt)) });
});

router.delete('/runs/:id', requireLab, async (req, res) => {
  const run = db.get('toolRuns', req.params.id);
  if (!run || run.userId !== req.user.id || run.scope !== 'lab') return res.status(404).json({ error: 'Draft not found.' });
  await db.remove('toolRuns', run.id);
  res.json({ ok: true });
});

// ---- saved designs (Design Studio documents) -----------------------------------------
const MAX_DESIGNS = 30;
const DesignSchema = z.object({
  name: z.string().trim().min(1).max(80),
  doc: z.object({ width: z.number().int().min(100).max(4000), height: z.number().int().min(100).max(4000) }).passthrough(),
});

const meta = ({ doc, ...d }) => ({ ...d, width: doc.width, height: doc.height, preset: doc.preset ?? null });

async function guardDesign(req, res, doc) {
  if (req.labMode !== 'partner') return true;
  const check = await guard({ kind: 'content', texts: docText(doc), brief: getBrief(), user: req.user });
  if (check.ok) return true;
  res.status(422).json({ error: check.message, guard: check });
  return false;
}

router.get('/designs', requireLab, (req, res) => {
  res.json({ designs: db.all('designs', (d) => d.userId === req.user.id).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).map(meta) });
});

router.get('/designs/:id', requireLab, (req, res) => {
  const d = db.get('designs', req.params.id);
  if (!d || d.userId !== req.user.id) return res.status(404).json({ error: 'Design not found.' });
  res.json({ design: d });
});

router.post('/designs', requireLab, async (req, res) => {
  const parsed = DesignSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'That design could not be saved.' });
  if (db.all('designs', (d) => d.userId === req.user.id).length >= MAX_DESIGNS) return res.status(409).json({ error: `You can keep up to ${MAX_DESIGNS} designs. Delete one first.` });
  if (!(await guardDesign(req, res, parsed.data.doc))) return;
  const design = await db.insert('designs', { userId: req.user.id, labMode: req.labMode, ...parsed.data });
  const play = await activity(req.user, 'design');
  res.status(201).json({ design: meta(design), play });
});

router.put('/designs/:id', requireLab, async (req, res) => {
  const d = db.get('designs', req.params.id);
  if (!d || d.userId !== req.user.id) return res.status(404).json({ error: 'Design not found.' });
  const parsed = DesignSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'That design could not be saved.' });
  if (!(await guardDesign(req, res, parsed.data.doc))) return;
  res.json({ design: meta(await db.update('designs', d.id, parsed.data)) });
});

router.delete('/designs/:id', requireLab, async (req, res) => {
  const d = db.get('designs', req.params.id);
  if (!d || d.userId !== req.user.id) return res.status(404).json({ error: 'Design not found.' });
  await db.remove('designs', d.id);
  res.json({ ok: true });
});

export default router;
