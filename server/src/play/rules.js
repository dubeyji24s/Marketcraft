// Engagement rules shared by the server and the browser preview (pure functions, no I/O):
// the month plan, daily streaks, daily missions, Idea Board steps and the junior medal.
// Design goal: keep learners coming back with small daily wins, without endless feeds,
// leaderboards for kids or pressure. One mission a day; streaks forgive a missed day.

export const MONTH_PLAN = [
  { week: 1, theme: 'Foundations', emoji: '🧭', slugs: ['know-your-customer', 'market-research-free', 'brand-identity', 'story-that-sells', 'word-of-mouth', 'honest-marketing', 'pricing-for-profit'] },
  { week: 2, theme: 'Words, pictures & video', emoji: '🎬', slugs: ['words-that-get-read', 'call-to-action', 'phone-product-photos', 'pitch-video-basics', 'video-abcd', 'accessible-marketing', 'social-media-that-sells'] },
  { week: 3, theme: 'Get found & plan ahead', emoji: '🗓️', slugs: ['google-business-profile', 'seo-basics', 'content-calendar', 'email-list-from-zero', 'markets-and-events', 'partner-up', 'one-page-marketing-plan'] },
  { week: 4, theme: 'Trust & happy customers', emoji: '🤝', slugs: ['honest-reviews', 'bad-reviews', 'effortless-service', 'keep-your-customers', 'customer-journey', 'truth-in-advertising', 'honest-green-claims'] },
  { week: 5, theme: 'Grow & protect', emoji: '🚀', slugs: ['disclose-like-a-pro', 'selling-online-promises', 'protect-your-business', 'launch-plan', 'track-what-works', 'test-and-improve', 'first-ad-budget', 'marketing-and-kids-privacy'] },
];
export const PLAN_ORDER = MONTH_PLAN.flatMap((w) => w.slugs);

// ---- days & streaks ------------------------------------------------------------------
export function dayKey(d = new Date()) {
  const x = new Date(d);
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
}
function daysBetween(a, b) {
  return Math.round((new Date(`${b}T12:00:00`) - new Date(`${a}T12:00:00`)) / 86_400_000);
}

/**
 * Streaks count days with at least one learning activity. One missed day is forgiven
 * (a "freeze") once per week, so a busy day doesn't wipe out weeks of effort.
 */
export function nextStreak(streak = {}, today) {
  const s = { count: 0, best: 0, last: null, freezeUsedOn: null, ...streak };
  if (s.last === today) return s;
  const gap = s.last ? daysBetween(s.last, today) : Infinity;
  const freezeOk = !s.freezeUsedOn || daysBetween(s.freezeUsedOn, today) >= 7;
  let count;
  let freezeUsedOn = s.freezeUsedOn;
  if (gap === 1) count = s.count + 1;
  else if (gap === 2 && freezeOk) { count = s.count + 1; freezeUsedOn = today; }
  else count = 1;
  return { count, best: Math.max(s.best, count), last: today, freezeUsedOn };
}
/** Streak as shown today: still alive if the last active day was today or yesterday (or 2 days with a freeze). */
export function liveStreak(streak = {}, today) {
  if (!streak.last) return { count: 0, best: streak.best ?? 0, activeToday: false };
  const gap = daysBetween(streak.last, today);
  const freezeOk = !streak.freezeUsedOn || daysBetween(streak.freezeUsedOn, today) >= 7;
  const alive = gap <= 1 || (gap === 2 && freezeOk);
  return { count: alive ? streak.count : 0, best: streak.best ?? streak.count, activeToday: gap === 0 };
}

// ---- daily missions --------------------------------------------------------------------
// kind = the activity that completes it
export const MISSIONS = [
  { id: 'swipe', kind: 'cards', emoji: '📱', kid: 'Swipe through one lesson', grown: 'Finish one swipe lesson (about 3 minutes)', to: '/app/learn' },
  { id: 'idea', kind: 'idea', emoji: '💡', kid: 'Add something to your Idea Board', grown: 'Move your Business Canvas one step forward', to: '/app/ideas' },
  { id: 'quiz', kind: 'lesson', emoji: '✏️', kid: 'Answer a lesson quiz', grown: 'Complete a lesson quiz', to: '/app/learn' },
  { id: 'cheer', kind: 'showcase', emoji: '👏', kid: 'Cheer someone\'s video in Showcase', grown: 'Watch and cheer a Showcase video', to: '/app/showcase' },
  { id: 'pitch', kind: 'pitch', emoji: '🎤', kid: 'Practise your pitch in the Studio', grown: 'Submit a pitch in the Studio', to: '/app/studio' },
];
export const MISSION_XP = 15;

function hash(str) {
  let h = 2166136261;
  for (const c of str) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return h >>> 0;
}
/** Same mission all day for a learner; a different one most days. Studio pitches appear twice a week at most. */
export function missionFor(user, today) {
  const pool = MISSIONS.filter((m) => m.kind !== 'pitch' || hash(user.id + today) % 3 === 0);
  const m = pool[hash(`${user.id}:${today}`) % pool.length];
  const grown = user.role !== 'kid';
  return { id: m.id, kind: m.kind, emoji: m.emoji, title: grown ? m.grown : m.kid, to: m.to, xp: MISSION_XP };
}

/**
 * Records a learning activity. Returns the user fields to save plus what happened,
 * so the caller can tell the learner (streak up, mission done).
 */
export function applyActivity(user, kind, now = new Date()) {
  const today = dayKey(now);
  const day = user.today?.date === today ? user.today : { date: today, kinds: [], missionDone: false };
  const kinds = day.kinds.includes(kind) ? day.kinds : [...day.kinds, kind];
  const streak = nextStreak(user.streak, today);
  const mission = missionFor(user, today);
  const missionJustDone = !day.missionDone && mission.kind === kind;
  return {
    patch: { streak, today: { date: today, kinds, missionDone: day.missionDone || missionJustDone } },
    bonusXp: missionJustDone ? MISSION_XP : 0,
    missionJustDone,
    streakUp: streak.count !== (user.streak?.count ?? 0) && user.streak?.last !== today,
    streak,
  };
}

export function todaySummary(user, now = new Date()) {
  const today = dayKey(now);
  const mission = missionFor(user, today);
  const done = user.today?.date === today && user.today.missionDone;
  return { date: today, streak: liveStreak(user.streak, today), mission: { ...mission, done } };
}

export function levelInfo(xp = 0) {
  const level = Math.floor(Math.sqrt(xp / 50)) + 1;
  const start = 50 * (level - 1) ** 2;
  const next = 50 * level ** 2;
  return { level, xp, into: xp - start, span: next - start };
}
export const LEVEL_TITLES = {
  kid: ['Idea Sprout', 'Lemonade Learner', 'Poster Pro', 'Pitch Rocket', 'Market Star', 'Brand Hero', 'Marketing Legend'],
  grown: ['Starter', 'Builder', 'Marketer', 'Strategist', 'Growth Lead', 'Brand Builder', 'Marketing Master'],
};
export function levelTitle(role, level) {
  const list = LEVEL_TITLES[role === 'kid' ? 'kid' : 'grown'];
  return list[Math.min(level, list.length) - 1];
}

// ---- Idea Board / Business Canvas ---------------------------------------------------------
export const IDEA_STEPS = [
  { id: 'dream', emoji: '✨', kid: 'Dream it', grown: 'The idea', done: (i) => i.name?.trim().length >= 2 && i.what?.trim().length >= 5 },
  { id: 'who', emoji: '🎯', kid: 'Who is it for?', grown: 'Target customer', done: (i) => (i.who?.length ?? 0) > 0 || i.whoText?.trim().length >= 3 },
  { id: 'special', emoji: '🌟', kid: 'What makes it special?', grown: 'Why you win', done: (i) => i.special?.trim().length >= 5 },
  { id: 'money', emoji: '💰', kid: 'Money maths', grown: 'Price & profit', done: (i) => Number(i.price) > 0 && Number(i.cost) >= 0 && i.cost !== '' && i.cost != null },
  { id: 'spread', emoji: '📣', kid: 'Spread the word', grown: 'Marketing channels', done: (i) => (i.channels?.length ?? 0) > 0 },
  { id: 'poster', emoji: '🖼️', kid: 'Make your poster', grown: 'Your one-line pitch', done: (i) => i.slogan?.trim().length >= 3 },
];
export const IDEA_STEP_XP = 10;
export const IDEA_LIMIT = 12;
export function ideaProgress(idea) {
  const steps = IDEA_STEPS.map((s) => ({ id: s.id, done: Boolean(s.done(idea)) }));
  return { steps, done: steps.filter((s) => s.done).length, total: steps.length };
}
/** XP for steps completed for the first time (steps are only rewarded once per idea). */
export function ideaReward(idea) {
  const awarded = new Set(idea.awarded ?? []);
  const fresh = ideaProgress(idea).steps.filter((s) => s.done && !awarded.has(s.id)).map((s) => s.id);
  return { fresh, xp: fresh.length * IDEA_STEP_XP, awarded: [...awarded, ...fresh], complete: ideaProgress(idea).done === IDEA_STEPS.length };
}

// ---- junior medal ------------------------------------------------------------------------
export const MEDAL_VIEWS = 1000;
export const MEDAL_STATUSES = ['requested', 'approved', 'shipped', 'declined'];
