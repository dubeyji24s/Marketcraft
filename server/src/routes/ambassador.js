// Ambassador Program: certified graduates promote the partner company using AI tools.
import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { customAlphabet } from 'nanoid';
import { db } from '../db.js';
import { config } from '../config.js';
import { requireAuth, requireAdmin, publicUser } from '../auth.js';
import { getBrief, saveBrief, referralLink, BRIEF_FIELDS, personalizeChallenge } from '../company.js';
import { toolCatalog, getTool, inputSchema, runTool } from '../ai/ambassadorTools.js';
import { reward } from '../progress.js';

const router = Router();
router.use(requireAuth);
const makeCode = customAlphabet('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 8);

export const GUIDELINES = [
  'Be honest. Only share facts from the company brief. Never invent prices, results or reviews.',
  'Always disclose. Every post says you are a brand ambassador (for example "#ad" or "I\'m a {company} ambassador").',
  'No spam. No buying followers, no fake reviews, no mass messages to strangers, no posting where promotion isn\'t allowed.',
  'Respect privacy. Never collect or share other people\'s personal information.',
  'The Ambassador Program is for account holders 18+. Kids take part only through a parent\'s account, with the parent in charge.',
  'Your company-website account is a normal user account. Use it like any customer and never try to access admin areas.',
  'Check before you post. Run every draft through the Compliance & Brand Checker.',
];
export const KID_RULE = 'Kids (using a parent\'s account): your parent or guardian approves and posts anything public. Never share your full name, school or location online.';

/** The account holder must be an adult: an 18+ confirmed account, or a parent's account for a kid. */
function isAdultAccount(user) {
  return user.role === 'admin' || Boolean(user.adultConfirmedAt) || user.accountHolder === 'parent';
}

function hasCertificate(user) {
  return db.all('certificates', (c) => c.userId === user.id && c.kind !== 'ambassador' && c.score >= config.passThreshold).length > 0;
}

/** Eligible = 18+ account holder (or parent account) with a certificate at the professional standard. */
function isEligible(user) {
  return user.role === 'admin' || (isAdultAccount(user) && hasCertificate(user));
}

function status(user) {
  const brief = getBrief();
  const mission = db.find('challenges', (c) => c.kind === 'ambassador');
  const missionCert = mission && db.find('certificates', (c) => c.userId === user.id && c.challengeId === mission.id);
  const companyName = brief.displayName;
  return {
    eligible: isEligible(user),
    adultAccount: isAdultAccount(user),
    certified: user.role === 'admin' || hasCertificate(user),
    joined: Boolean(user.ambassador),
    ambassador: user.ambassador ?? null,
    referralLink: referralLink(brief, user.ambassador?.code),
    passThreshold: config.passThreshold,
    company: { name: brief.displayName, website: brief.website, tagline: brief.tagline, description: brief.description, products: brief.products, hashtags: brief.hashtags, configured: Boolean(brief.description) },
    guidelines: [...GUIDELINES.map((g) => g.replaceAll('{company}', companyName)), ...(user.role === 'kid' ? [KID_RULE] : [])],
    isKid: user.role === 'kid',
    mission: mission ? { id: mission.id, title: personalizeChallenge(mission, brief).title, certificateId: missionCert?.id ?? null } : null,
    tools: toolCatalog(),
    aiEnabled: config.aiEnabled,
  };
}

router.get('/status', (req, res) => res.json(status(req.user)));

const JoinSchema = z.object({
  agreeGuidelines: z.literal(true),
  parentApproval: z.boolean().optional(),
});

router.post('/join', async (req, res) => {
  if (req.user.ambassador) return res.json({ ...status(req.user), newBadges: [] });
  if (!isAdultAccount(req.user)) {
    return res.status(403).json({ error: 'The Ambassador Program is for account holders 18 and older. Kids can join through a parent\'s account.' });
  }
  if (!isEligible(req.user)) {
    return res.status(403).json({ error: `Earn a practice certificate (${config.passThreshold}%+) in the Studio to unlock the Ambassador Program.` });
  }
  const parsed = JoinSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Please agree to the ambassador guidelines.' });
  if (req.user.role === 'kid' && parsed.data.parentApproval !== true) {
    return res.status(400).json({ error: 'A parent or guardian needs to approve joining the Ambassador Program.' });
  }
  let code;
  do code = makeCode();
  while (db.find('users', (u) => u.ambassador?.code === code));
  const user = await db.update('users', req.user.id, {
    ambassador: { code, joinedAt: new Date().toISOString(), parentApproved: req.user.role === 'kid' ? true : undefined },
  });
  const newBadges = await reward(user, { xp: 50, badges: ['ambassador'] });
  res.status(201).json({ ...status(db.get('users', user.id)), newBadges });
});

// ---- AI tools -------------------------------------------------------------------
const toolLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: (req) => (req.user?.role === 'admin' ? 200 : 40),
  keyGenerator: (req) => req.user.id,
  message: { error: 'You have used the AI tools a lot this hour. Take a break and try again soon.' },
});

function requireAmbassador(req, res, next) {
  if (req.user.ambassador || req.user.role === 'admin') return next();
  res.status(403).json({ error: 'Join the Ambassador Program to use the AI marketing tools.' });
}

router.post('/tools/:id', requireAmbassador, toolLimiter, async (req, res, next) => {
  const tool = getTool(req.params.id);
  if (!tool) return res.status(404).json({ error: 'Tool not found.' });
  const parsed = inputSchema(tool).safeParse(req.body?.inputs ?? {});
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
  try {
    const brief = getBrief();
    const output = await runTool({ tool, inputs: parsed.data, brief, user: req.user, referralLink: referralLink(brief, req.user.ambassador?.code) });
    const run = await db.insert('toolRuns', { userId: req.user.id, toolId: tool.id, inputs: parsed.data, output });
    // keep each user's 30 most recent drafts
    const mine = db.all('toolRuns', (r) => r.userId === req.user.id && r.scope !== 'lab').sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    for (const old of mine.slice(30)) await db.remove('toolRuns', old.id);
    res.status(201).json({ run });
  } catch (err) {
    next(err);
  }
});

router.get('/runs', requireAmbassador, (req, res) => {
  const runs = db.all('toolRuns', (r) => r.userId === req.user.id && r.scope !== 'lab').sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  res.json({ runs });
});

router.delete('/runs/:id', requireAmbassador, async (req, res) => {
  const run = db.get('toolRuns', req.params.id);
  if (!run || run.userId !== req.user.id) return res.status(404).json({ error: 'Draft not found.' });
  await db.remove('toolRuns', run.id);
  res.json({ ok: true });
});

// ---- Company brief (admin) ------------------------------------------------------
router.get('/brief', requireAdmin, (_req, res) => res.json({ brief: getBrief() }));

const BriefSchema = z.object(
  Object.fromEntries(BRIEF_FIELDS.map((k) => [k, k === 'website' ? z.string().trim().url().or(z.literal('')) : z.string().trim().max(k === 'name' ? 80 : 2000)])),
);

router.put('/brief', requireAdmin, async (req, res) => {
  const parsed = BriefSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: `${parsed.error.issues[0].path[0]}: ${parsed.error.issues[0].message}` });
  res.json({ brief: await saveBrief(parsed.data) });
});

// ---- Ambassador roster (admin) -----------------------------------------------------
router.get('/roster', requireAdmin, (_req, res) => {
  const mission = db.find('challenges', (c) => c.kind === 'ambassador');
  const ambassadors = db
    .all('users', (u) => u.ambassador)
    .map((u) => ({
      ...publicUser(u),
      toolRuns: db.all('toolRuns', (r) => r.userId === u.id).length,
      missionCertified: Boolean(mission && db.find('certificates', (c) => c.userId === u.id && c.challengeId === mission.id)),
    }));
  res.json({ ambassadors });
});

export default router;
