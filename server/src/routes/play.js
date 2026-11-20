// Daily engagement: today's streak + mission, swipe-lesson completion and the Idea Board.
import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { db } from '../db.js';
import { requireAuth } from '../auth.js';
import { reward, activity } from '../progress.js';
import { todaySummary, levelInfo, levelTitle, PLAN_ORDER, ideaProgress, ideaReward, IDEA_LIMIT, dayKey, flashbackPicks } from '../play/rules.js';
import { SCENARIOS } from '../lessons-scenarios.js';

const router = Router();
router.use(requireAuth);

const visibleLesson = (u) => (l) => l.published && (u.role === 'admin' || !l.audiences || l.audiences.includes(u.role));

/** Next lesson in the month plan the learner hasn't finished. */
function nextLesson(u) {
  const lessons = db.all('lessons', visibleLesson(u));
  const bySlug = new Map(lessons.map((l) => [l.slug, l]));
  const l = PLAN_ORDER.map((s) => bySlug.get(s)).find((x) => x && !u.completedLessons.includes(x.id));
  return l ? { id: l.id, title: l.title, estimatedMinutes: l.estimatedMinutes, day: PLAN_ORDER.filter((s) => bySlug.has(s)).indexOf(l.slug) + 1 } : null;
}

router.get('/today', (req, res) => {
  const u = req.user;
  const lvl = levelInfo(u.xp);
  res.json({
    ...todaySummary(u),
    level: { ...lvl, title: levelTitle(u.role, lvl.level) },
    nextLesson: nextLesson(u),
    cardsDone: u.cardsDone?.length ?? 0,
    ideas: db.all('ideas', (i) => i.userId === u.id).length,
  });
});

// ---- swipe lessons -----------------------------------------------------------------------
router.post('/cards/:lessonId', async (req, res) => {
  const lesson = db.get('lessons', req.params.lessonId);
  if (!lesson || !(visibleLesson(req.user)(lesson) || lesson.ownerId === req.user.id)) return res.status(404).json({ error: 'Lesson not found.' });
  const done = req.user.cardsDone ?? [];
  const first = !done.includes(lesson.id);
  let newBadges = [];
  if (first) {
    await db.update('users', req.user.id, { cardsDone: [...done, lesson.id] });
    newBadges = await reward(req.user, { xp: 10, badges: done.length + 1 >= 5 ? ['swiper'] : [] });
  }
  const play = await activity(req.user, 'cards');
  res.json({ xpEarned: first ? 10 : 0, newBadges: [...newBadges, ...play.newBadges], play });
});

// ---- "What would you do?" scenarios ----------------------------------------------------------
router.post('/scenario/:lessonId', async (req, res) => {
  const lesson = db.get('lessons', req.params.lessonId);
  const sc = lesson && SCENARIOS[lesson.slug];
  if (!lesson || !sc || !visibleLesson(req.user)(lesson)) return res.status(404).json({ error: 'Scenario not found.' });
  const choice = Number(req.body?.choice);
  if (!Number.isInteger(choice) || !sc.options[choice]) return res.status(400).json({ error: 'Pick one of the options.' });
  const done = req.user.scenariosDone ?? [];
  const first = !done.includes(lesson.id);
  let newBadges = [];
  if (first) {
    await db.update('users', req.user.id, { scenariosDone: [...done, lesson.id] });
    newBadges = await reward(req.user, { xp: 5, badges: done.length + 1 >= 10 ? ['decider'] : [] });
  }
  const play = await activity(req.user, 'scenario');
  res.json({ best: sc.options[choice].best, xpEarned: first ? 5 : 0, newBadges: [...newBadges, ...play.newBadges], play });
});

// ---- daily Flashback: spaced review of finished lessons ---------------------------------------
router.get('/review', (req, res) => {
  const lessons = db.all('lessons', (l) => req.user.completedLessons.includes(l.id) && (l.quiz?.length ?? 0) > 0);
  const today = dayKey();
  const picks = flashbackPicks(lessons.map((l) => ({ id: l.id, count: l.quiz.length })), `${req.user.id}:${today}`, 3);
  const questions = picks.map(({ id, index }) => {
    const l = lessons.find((x) => x.id === id);
    const q = l.quiz[index];
    return { lessonId: l.id, lessonTitle: l.title, index, question: q.question, options: q.options };
  });
  res.json({ date: today, questions, doneToday: req.user.reviewLast === today });
});

router.post('/review/done', async (req, res) => {
  const today = dayKey();
  if (req.user.reviewLast === today) return res.json({ xpEarned: 0, newBadges: [], play: null });
  const days = (req.user.reviewDays ?? 0) + 1;
  await db.update('users', req.user.id, { reviewLast: today, reviewDays: days });
  const newBadges = await reward(req.user, { xp: 10, badges: days >= 5 ? ['flashback'] : [] });
  const play = await activity(req.user, 'review');
  res.json({ xpEarned: 10, newBadges: [...newBadges, ...play.newBadges], play });
});

// ---- Idea Board ---------------------------------------------------------------------------
const text = (max) => z.string().trim().max(max).optional().default('');
const IdeaSchema = z.object({
  emoji: z.string().trim().max(8).optional().default('💡'),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional().default('#7c5cff'),
  name: text(60),
  what: text(300),
  who: z.array(z.string().trim().min(1).max(40)).max(8).optional().default([]),
  whoText: text(200),
  special: text(300),
  cost: z.union([z.number().min(0).max(1_000_000), z.literal('')]).optional().default(''),
  price: z.union([z.number().min(0).max(1_000_000), z.literal('')]).optional().default(''),
  channels: z.array(z.string().trim().min(1).max(40)).max(10).optional().default([]),
  slogan: text(120),
  picture: z
    .string()
    .max(450_000, 'That picture is too big. Try a smaller one.')
    .refine((s) => !s || /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(s), 'Pictures must be PNG, JPG or WebP.')
    .optional()
    .default(''),
});

const ideaOut = (i) => ({ ...i, progress: ideaProgress(i) });
const ideaLimiter = rateLimit({ windowMs: 60_000, limit: 60, keyGenerator: (req) => req.user.id, message: { error: 'Slow down a little — your work is saved.' } });

router.get('/ideas', (req, res) => {
  const ideas = db.all('ideas', (i) => i.userId === req.user.id).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  res.json({ ideas: ideas.map(ideaOut) });
});

async function rewardIdea(user, idea) {
  const r = ideaReward(idea);
  if (!r.fresh.length) return { xpEarned: 0, newBadges: [], play: null, idea };
  const saved = await db.update('ideas', idea.id, { awarded: r.awarded });
  const newBadges = await reward(user, { xp: r.xp, badges: r.complete ? ['idea-builder'] : [] });
  const play = await activity(user, 'idea');
  return { xpEarned: r.xp, newBadges: [...newBadges, ...play.newBadges], play, idea: saved };
}

router.post('/ideas', ideaLimiter, async (req, res) => {
  if (db.all('ideas', (i) => i.userId === req.user.id).length >= IDEA_LIMIT) return res.status(400).json({ error: `You can keep up to ${IDEA_LIMIT} ideas. Delete one to start another.` });
  const parsed = IdeaSchema.safeParse(req.body ?? {});
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
  const idea = await db.insert('ideas', { ...parsed.data, userId: req.user.id, awarded: [] });
  const r = await rewardIdea(req.user, idea);
  res.status(201).json({ idea: ideaOut(r.idea), xpEarned: r.xpEarned, newBadges: r.newBadges, play: r.play });
});

router.put('/ideas/:id', ideaLimiter, async (req, res) => {
  const idea = db.get('ideas', req.params.id);
  if (!idea || idea.userId !== req.user.id) return res.status(404).json({ error: 'Idea not found.' });
  const parsed = IdeaSchema.safeParse(req.body ?? {});
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
  const saved = await db.update('ideas', idea.id, parsed.data);
  const r = await rewardIdea(req.user, saved);
  res.json({ idea: ideaOut(r.idea), xpEarned: r.xpEarned, newBadges: r.newBadges, play: r.play });
});

router.delete('/ideas/:id', async (req, res) => {
  const idea = db.get('ideas', req.params.id);
  if (!idea || idea.userId !== req.user.id) return res.status(404).json({ error: 'Idea not found.' });
  await db.remove('ideas', idea.id);
  res.json({ ok: true });
});

export default router;
