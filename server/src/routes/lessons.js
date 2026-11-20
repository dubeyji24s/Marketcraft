import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { db } from '../db.js';
import { requireAuth, requireAdmin } from '../auth.js';
import { generateLesson } from '../ai/research.js';
import { reward, activity } from '../progress.js';

const router = Router();
router.use(requireAuth);

const visibleTo = (user) => (l) =>
  user.role === 'admin' || l.ownerId === user.id || (l.published && (!l.audiences || l.audiences.includes(user.role)));

const stripAnswers = (l) => ({ ...l, quiz: (l.quiz || []).map(({ answerIndex, ...q }) => q) });

router.get('/', (req, res) => {
  const lessons = db
    .all('lessons', visibleTo(req.user))
    .map(({ sections, quiz, ...meta }) => ({ ...meta, sectionCount: sections?.length ?? 0, completed: req.user.completedLessons.includes(meta.id) }));
  res.json({ lessons });
});

router.get('/:id', (req, res) => {
  const lesson = db.get('lessons', req.params.id);
  if (!lesson || !visibleTo(req.user)(lesson)) return res.status(404).json({ error: 'Lesson not found.' });
  res.json({ lesson: stripAnswers(lesson), completed: req.user.completedLessons.includes(lesson.id) });
});

router.post('/:id/complete', async (req, res) => {
  const lesson = db.get('lessons', req.params.id);
  if (!lesson || !visibleTo(req.user)(lesson)) return res.status(404).json({ error: 'Lesson not found.' });
  const answers = z.array(z.number().int()).safeParse(req.body?.answers);
  if (!answers.success) return res.status(400).json({ error: 'Answers must be a list of option numbers.' });

  const results = (lesson.quiz || []).map((q, i) => ({ correct: answers.data[i] === q.answerIndex, answerIndex: q.answerIndex }));
  const correct = results.filter((r) => r.correct).length;
  const perfect = results.length > 0 && correct === results.length;
  const firstTime = !req.user.completedLessons.includes(lesson.id);

  let newBadges = [];
  if (firstTime) {
    await db.update('users', req.user.id, { completedLessons: [...req.user.completedLessons, lesson.id] });
    newBadges = await reward(req.user, {
      xp: 20 + correct * 10,
      badges: ['first-lesson', ...(perfect ? ['quiz-ace'] : [])],
    });
  }
  const play = await activity(req.user, 'lesson');
  res.json({ results, correct, total: results.length, xpEarned: firstTime ? 20 + correct * 10 : 0, newBadges: [...newBadges, ...play.newBadges], play });
});

// ---- AI Research Engine ----------------------------------------------------
const researchLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: (req) => (req.user?.role === 'admin' ? 50 : 5),
  keyGenerator: (req) => req.user.id,
  message: { error: 'You have used your research requests for this hour. Try again later.' },
});

const ResearchSchema = z.object({
  topic: z.string().trim().min(4).max(160),
  audience: z.enum(['kid', 'adult', 'professional']).optional(),
});

router.post('/research', researchLimiter, async (req, res, next) => {
  const parsed = ResearchSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Describe a marketing topic in 4-160 characters.' });
  const role = req.user.role === 'admin' ? parsed.data.audience ?? 'adult' : req.user.role;
  try {
    const draft = await generateLesson({ topic: parsed.data.topic, role });
    const lesson = await db.insert('lessons', {
      ...draft,
      ownerId: req.user.id,
      audiences: [role],
      // learners get a private lesson; admin drafts await review before publishing
      published: false,
    });
    res.status(201).json({ lesson: stripAnswers(lesson) });
  } catch (err) {
    next(err);
  }
});

// ---- Admin moderation -------------------------------------------------------
const PatchSchema = z.object({
  published: z.boolean().optional(),
  audiences: z.array(z.enum(['kid', 'adult', 'professional'])).min(1).optional(),
  title: z.string().trim().min(3).max(120).optional(),
});

router.patch('/:id', requireAdmin, async (req, res) => {
  const parsed = PatchSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid update.' });
  const lesson = db.get('lessons', req.params.id);
  if (!lesson) return res.status(404).json({ error: 'Lesson not found.' });
  if (parsed.data.published && lesson.originality && !lesson.originality.passed) {
    return res.status(409).json({ error: 'This draft failed the originality check. Regenerate it before publishing.' });
  }
  res.json({ lesson: await db.update('lessons', lesson.id, parsed.data) });
});

router.delete('/:id', async (req, res) => {
  const lesson = db.get('lessons', req.params.id);
  if (!lesson) return res.status(404).json({ error: 'Lesson not found.' });
  if (req.user.role !== 'admin' && lesson.ownerId !== req.user.id) return res.status(403).json({ error: 'Not allowed.' });
  await db.remove('lessons', lesson.id);
  res.json({ ok: true });
});

export default router;
