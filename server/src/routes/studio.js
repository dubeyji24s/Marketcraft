// Practice Studio: challenges, submissions (+ AI evaluation) and certificates.
import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { customAlphabet } from 'nanoid';
import { db } from '../db.js';
import { requireAuth } from '../auth.js';
import { config } from '../config.js';
import { videoUpload, uploadPath, removeUpload, toEmbedUrl } from '../uploads.js';
import { evaluateSubmission, RUBRICS } from '../ai/evaluator.js';
import { getBrief, personalizeChallenge } from '../company.js';
import { briefToText } from '../ai/ambassadorTools.js';
import { reward, levelFor } from '../progress.js';
import { publicUser } from '../auth.js';
import { BADGES } from '../seed.js';

const router = Router();
const upload = videoUpload('submissions');
const verifyCode = customAlphabet('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 10);

// ---- public certificate verification (no login) ----------------------------
router.get('/certificates/verify/:code', (req, res) => {
  const c = db.find('certificates', (x) => x.verifyCode === String(req.params.code).toUpperCase());
  if (!c) return res.status(404).json({ valid: false });
  res.json({ valid: true, recipientName: c.recipientName, challengeTitle: c.challengeTitle, badge: c.badge, tier: c.tier, issuedAt: c.issuedAt });
});

router.use(requireAuth);

router.get('/rubric', (_req, res) => {
  res.json({ rubrics: RUBRICS, passThreshold: config.passThreshold, distinctionThreshold: config.distinctionThreshold, aiEnabled: config.aiEnabled });
});

// ---- dashboard summary -------------------------------------------------------
router.get('/dashboard', (req, res) => {
  const u = req.user;
  const subs = db.all('submissions', (s) => s.userId === u.id);
  res.json({
    user: publicUser(u),
    level: levelFor(u.xp),
    badgeCatalog: BADGES,
    passThreshold: config.passThreshold,
    stats: {
      lessonsCompleted: u.completedLessons.length,
      lessonsTotal: db.all('lessons', (l) => l.published && (u.role === 'admin' || !l.audiences || l.audiences.includes(u.role))).length,
      submissions: subs.length,
      passed: new Set(subs.filter((s) => s.evaluation?.passed).map((s) => s.challengeId)).size,
      certificates: db.all('certificates', (c) => c.userId === u.id).length,
      bestScore: Math.max(0, ...subs.map((s) => s.evaluation?.percent ?? 0)),
    },
  });
});

// ---- challenges --------------------------------------------------------------
// Practice challenges by role; the Ambassador Mission only for program members.
const forRole = (user) => (c) =>
  (user.role === 'admin' || c.audiences.includes(user.role)) && (c.kind !== 'ambassador' || user.role === 'admin' || Boolean(user.ambassador));

router.get('/challenges', (req, res) => {
  const mine = db.all('submissions', (s) => s.userId === req.user.id);
  const brief = getBrief();
  const challenges = db.all('challenges', forRole(req.user)).map((c) => {
    const attempts = mine.filter((s) => s.challengeId === c.id);
    return {
      ...personalizeChallenge(c, brief),
      attempts: attempts.length,
      bestScore: Math.max(0, ...attempts.map((s) => s.evaluation?.percent ?? 0)),
      passed: attempts.some((s) => s.evaluation?.passed),
    };
  });
  res.json({ challenges });
});

/** "Assign me one": the first challenge not yet passed, easiest first. */
router.post('/challenges/assign', (req, res) => {
  const order = { starter: 0, intermediate: 1, advanced: 2 };
  const passedIds = new Set(db.all('submissions', (s) => s.userId === req.user.id && s.evaluation?.passed).map((s) => s.challengeId));
  const next = db
    .all('challenges', forRole(req.user))
    .filter((c) => c.kind !== 'ambassador' && !passedIds.has(c.id))
    .sort((a, b) => order[a.difficulty] - order[b.difficulty])[0];
  if (!next) return res.json({ challenge: null, message: 'You have passed every challenge. Legendary!' });
  res.json({ challenge: next });
});

router.get('/challenges/:id', (req, res) => {
  const c = db.get('challenges', req.params.id);
  if (!c || !forRole(req.user)(c)) return res.status(404).json({ error: 'Challenge not found.' });
  const attempts = db
    .all('submissions', (s) => s.userId === req.user.id && s.challengeId === c.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map(serializeSubmission);
  res.json({ challenge: personalizeChallenge(c), attempts });
});

// ---- submissions -------------------------------------------------------------
const FRAME_RE = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/;

const SubmissionSchema = z.object({
  challengeId: z.string().min(1),
  channel: z.enum(['social', 'digital-ad', 'outdoor']),
  explanation: z.string().trim().min(60, 'Explain your strategy in at least 60 characters.').max(4000),
  transcript: z.string().trim().max(8000).optional().default(''),
  videoUrl: z
    .string()
    .trim()
    .url()
    .refine((u) => u.startsWith('https://'), 'Video links must start with https://')
    .optional()
    .or(z.literal('')),
  frames: z
    .string()
    .optional()
    .transform((s, ctx) => {
      if (!s) return [];
      try {
        const arr = JSON.parse(s);
        if (!Array.isArray(arr) || arr.length > 6) throw new Error();
        return arr.map((f) => {
          const m = FRAME_RE.exec(f);
          if (!m || m[2].length > 2_000_000) throw new Error();
          return { mediaType: m[1], data: m[2] };
        });
      } catch {
        ctx.addIssue({ code: 'custom', message: 'Video frames were malformed. Try re-selecting the video.' });
        return z.NEVER;
      }
    }),
});

function serializeSubmission(s) {
  return {
    ...s,
    videoSrc: s.videoFile ? `/api/studio/submissions/${s.id}/video` : null,
    embedUrl: s.videoUrl ? toEmbedUrl(s.videoUrl) : null,
  };
}

const submitLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 30, // unlimited retries in spirit; this only stops automated abuse
  keyGenerator: (req) => req.user.id,
  message: { error: 'Whoa, lots of attempts! Take a short break and try again in a bit.' },
});

router.post('/submissions', submitLimiter, upload.single('video'), async (req, res, next) => {
  const cleanup = () => removeUpload('submissions', req.file?.filename);
  const parsed = SubmissionSchema.safeParse(req.body);
  if (!parsed.success) {
    cleanup();
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }
  const d = parsed.data;
  if (!req.file && !d.videoUrl) {
    cleanup();
    return res.status(400).json({ error: 'Upload your pitch video or paste a link to it.' });
  }
  const stored = db.get('challenges', d.challengeId);
  if (!stored || !forRole(req.user)(stored)) {
    cleanup();
    return res.status(404).json({ error: 'Challenge not found.' });
  }
  const brief = getBrief();
  const challenge = { ...personalizeChallenge(stored, brief), ...(stored.kind === 'ambassador' ? { companyBrief: briefToText(brief) } : {}) };
  if (challenge.kind === 'ambassador' && !brief.description) {
    cleanup();
    return res.status(409).json({ error: 'The company brief has not been filled in yet. Ask an admin to complete it.' });
  }

  let evaluation;
  try {
    evaluation = await evaluateSubmission({ challenge, submission: d, role: req.user.role });
  } catch (err) {
    cleanup();
    return next(err);
  }

  const previous = db.all('submissions', (s) => s.userId === req.user.id && s.challengeId === challenge.id);
  const submission = await db.insert('submissions', {
    userId: req.user.id,
    challengeId: challenge.id,
    challengeTitle: challenge.title,
    attempt: previous.length + 1,
    channel: d.channel,
    explanation: d.explanation,
    transcript: d.transcript,
    videoUrl: d.videoUrl || null,
    videoFile: req.file?.filename ?? null,
    frameCount: d.frames.length,
    evaluation,
  });

  // ---- certificate + rewards ----
  let certificate = null;
  const badges = ['first-pitch'];
  let xp = 15;
  if (evaluation.passed) {
    xp += 50 + (evaluation.distinction ? 50 : 0);
    badges.push('certified');
    if (evaluation.distinction) badges.push('distinction');
    if (previous.some((s) => !s.evaluation?.passed)) badges.push('comeback');
    if (challenge.kind === 'ambassador') badges.push('brand-certified');
    certificate = await issueCertificate(req.user, challenge, submission, evaluation);
  }
  const newBadges = await reward(req.user, { xp, badges });

  res.status(201).json({ submission: serializeSubmission(submission), certificate, newBadges, xpEarned: xp });
});

async function issueCertificate(user, challenge, submission, evaluation) {
  const tier = evaluation.distinction ? 'Distinction' : 'Certified';
  const existing = db.find('certificates', (c) => c.userId === user.id && c.challengeId === challenge.id);
  if (existing) {
    // only upgrade (better score) — never downgrade an earned certificate
    if (evaluation.percent <= existing.score) return existing;
    return db.update('certificates', existing.id, { tier, score: evaluation.percent, submissionId: submission.id, issuedAt: new Date().toISOString() });
  }
  return db.insert('certificates', {
    userId: user.id,
    recipientName: user.name,
    challengeId: challenge.id,
    challengeTitle: challenge.title,
    kind: challenge.kind ?? 'practice',
    badge: challenge.certificateBadge,
    color: challenge.color,
    tier,
    score: evaluation.percent,
    submissionId: submission.id,
    issuedAt: new Date().toISOString(),
    verifyCode: verifyCode(),
  });
}

router.get('/submissions', (req, res) => {
  const subs = db
    .all('submissions', (s) => s.userId === req.user.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map(serializeSubmission);
  res.json({ submissions: subs });
});

router.get('/submissions/:id/video', (req, res) => {
  const s = db.get('submissions', req.params.id);
  if (!s?.videoFile || (s.userId !== req.user.id && req.user.role !== 'admin')) return res.status(404).end();
  res.sendFile(uploadPath('submissions', s.videoFile));
});

// ---- certificates ------------------------------------------------------------
router.get('/certificates', (req, res) => {
  res.json({ certificates: db.all('certificates', (c) => c.userId === req.user.id) });
});

router.get('/certificates/:id', (req, res) => {
  const c = db.get('certificates', req.params.id);
  if (!c || (c.userId !== req.user.id && req.user.role !== 'admin')) return res.status(404).json({ error: 'Certificate not found.' });
  res.json({ certificate: c });
});

export default router;
