// My Marketing Lab: unlocked by the Ambassador certificate. Graduates market their OWN
// product or service with all six AI tools, a design studio and a video maker.
import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { db } from '../db.js';
import { config } from '../config.js';
import { requireAuth } from '../auth.js';
import { toolCatalog, getTool, inputSchema, runTool } from '../ai/ambassadorTools.js';
import { reward } from '../progress.js';

const router = Router();
router.use(requireAuth);

const BRAND_FIELDS = ['name', 'website', 'tagline', 'description', 'products', 'audience', 'keyMessages', 'offers', 'voice', 'dos', 'donts', 'hashtags'];
const emptyBrand = () => Object.fromEntries(BRAND_FIELDS.map((k) => [k, '']));

function labUnlocked(user) {
  if (user.role === 'admin') return true;
  const mission = db.find('challenges', (c) => c.kind === 'ambassador');
  return Boolean(mission && db.find('certificates', (c) => c.userId === user.id && c.challengeId === mission.id && c.score >= config.passThreshold));
}

function requireLab(req, res, next) {
  if (labUnlocked(req.user)) return next();
  res.status(403).json({ error: 'Your Marketing Lab unlocks when you earn the Ambassador certificate (complete the Ambassador Mission).' });
}

router.get('/status', (req, res) => {
  const mission = db.find('challenges', (c) => c.kind === 'ambassador');
  res.json({
    unlocked: labUnlocked(req.user),
    missionId: mission?.id ?? null,
    passThreshold: config.passThreshold,
    brand: { ...emptyBrand(), ...(req.user.lab?.brand ?? {}) },
    tools: toolCatalog(),
    aiEnabled: config.aiEnabled,
  });
});

const BrandSchema = z.object(
  Object.fromEntries(BRAND_FIELDS.map((k) => [k, k === 'website' ? z.string().trim().url('Website must be a full link, like https://…').or(z.literal('')) : z.string().trim().max(k === 'name' ? 80 : 2000)])),
);

router.put('/brand', requireLab, async (req, res) => {
  const parsed = BrandSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
  if (!parsed.data.name) return res.status(400).json({ error: 'Give your brand a name.' });
  const first = !req.user.lab?.brand?.name;
  await db.update('users', req.user.id, { lab: { ...(req.user.lab ?? {}), brand: parsed.data } });
  const newBadges = first ? await reward(db.get('users', req.user.id), { xp: 30, badges: ['lab'] }) : [];
  res.json({ brand: parsed.data, newBadges });
});

// ---- AI tools on the learner's own brand -------------------------------------------
const toolLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: (req) => (req.user?.role === 'admin' ? 200 : 40),
  keyGenerator: (req) => req.user.id,
  message: { error: 'You have used the AI tools a lot this hour. Take a break and try again soon.' },
});

router.post('/tools/:id', requireLab, toolLimiter, async (req, res, next) => {
  const tool = getTool(req.params.id);
  if (!tool) return res.status(404).json({ error: 'Tool not found.' });
  const brand = req.user.lab?.brand;
  if (!brand?.name || !brand.description) return res.status(409).json({ error: 'Fill in "My brand" first (at least the name and what it does), so the AI knows what to market.' });
  const parsed = inputSchema(tool).safeParse(req.body?.inputs ?? {});
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
  try {
    const output = await runTool({ tool, inputs: parsed.data, brief: brand, user: req.user, referralLink: brand.website, mode: 'own' });
    const run = await db.insert('toolRuns', { userId: req.user.id, scope: 'lab', toolId: tool.id, inputs: parsed.data, output, engine: config.aiEnabled ? 'ai' : 'starter' });
    const mine = db.all('toolRuns', (r) => r.userId === req.user.id && r.scope === 'lab').sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    for (const old of mine.slice(50)) await db.remove('toolRuns', old.id);
    res.status(201).json({ run });
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
  const design = await db.insert('designs', { userId: req.user.id, ...parsed.data });
  res.status(201).json({ design: meta(design) });
});

router.put('/designs/:id', requireLab, async (req, res) => {
  const d = db.get('designs', req.params.id);
  if (!d || d.userId !== req.user.id) return res.status(404).json({ error: 'Design not found.' });
  const parsed = DesignSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'That design could not be saved.' });
  res.json({ design: meta(await db.update('designs', d.id, parsed.data)) });
});

router.delete('/designs/:id', requireLab, async (req, res) => {
  const d = db.get('designs', req.params.id);
  if (!d || d.userId !== req.user.id) return res.status(404).json({ error: 'Design not found.' });
  await db.remove('designs', d.id);
  res.json({ ok: true });
});

export default router;
