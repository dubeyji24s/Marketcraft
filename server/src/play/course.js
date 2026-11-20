// The personalised course: built from the learner's quick personalisation test.
// Same engine on the server and in the browser preview (pure functions, no I/O).
//
// Design:
// - Every learner gets a day-by-day course: one lesson per day plus a short, a decision,
//   a quick Flashback and a hands-on project for their track (kid / owner / pro).
// - Order adapts to goals and interests; experienced learners get foundations as quick reviews.
// - Pacing: one new day unlocks per calendar day, so the course always takes at least a month
//   (31 days for kids, 36 for grown-ups) while a 15–30 minute daily habit keeps it light.
import { MONTH_PLAN, dayKey } from './rules.js';
import { PROJECTS } from './projects.js';

export const TRACKS = { kid: 'kid', adult: 'owner', professional: 'pro', admin: 'pro' };
export const trackFor = (role) => TRACKS[role] ?? 'owner';

export const TOPICS = {
  video: { label: 'Videos & photos', icon: 'studio', slugs: ['pitch-video-basics', 'video-abcd', 'phone-product-photos'] },
  social: { label: 'Social media & content', icon: 'phone', slugs: ['social-media-that-sells', 'content-calendar', 'words-that-get-read'] },
  money: { label: 'Prices & money', icon: 'coins', slugs: ['pricing-for-profit', 'first-ad-budget', 'one-page-marketing-plan'] },
  local: { label: 'Local & in person', icon: 'tent', slugs: ['markets-and-events', 'google-business-profile', 'partner-up', 'word-of-mouth'] },
  online: { label: 'Selling online', icon: 'package', slugs: ['seo-basics', 'selling-online-promises', 'email-list-from-zero', 'call-to-action'] },
  brand: { label: 'Brand & stories', icon: 'palette', slugs: ['brand-identity', 'story-that-sells'] },
  customers: { label: 'Happy customers', icon: 'heart', slugs: ['know-your-customer', 'keep-your-customers', 'effortless-service', 'customer-journey', 'honest-reviews', 'bad-reviews'] },
  data: { label: 'Numbers & testing', icon: 'chart', slugs: ['track-what-works', 'test-and-improve', 'market-research-free'] },
  rules: { label: 'Honesty, rules & safety', icon: 'scale', slugs: ['honest-marketing', 'truth-in-advertising', 'honest-green-claims', 'disclose-like-a-pro', 'marketing-and-kids-privacy', 'protect-your-business', 'accessible-marketing'] },
};

/** The personalisation test. Questions differ by track; answers map to a profile. */
export const QUIZ = {
  kid: [
    { id: 'goal', q: 'What would you love to do?', options: [['sell', 'Sell something I make', 'ideas', 'money'], ['service', 'Offer a service (like pet-sitting)', 'heart', 'customers'], ['fundraise', 'Raise money for school or a charity', 'gift', 'local'], ['learn', 'Just learn how marketing works', 'learn', null]] },
    { id: 'level', q: 'Have you ever sold anything?', options: [['starter', 'Not yet', 'leaf'], ['growing', 'A few times', 'rocket'], ['advanced', 'I have a little business', 'crown']] },
    { id: 'interests', q: 'What sounds most fun? Pick up to 3.', multi: 3, options: [['video', 'Making videos', 'studio'], ['brand', 'Designing posters & logos', 'palette'], ['local', 'Selling at fairs & markets', 'tent'], ['money', 'Money & prices', 'coins'], ['social', 'Posting online (with a parent)', 'phone'], ['customers', 'Making customers happy', 'heart']] },
    { id: 'format', q: 'How do you like to learn?', options: [['shorts', 'Watch shorts', 'studio'], ['swipe', 'Swipe cards', 'phone'], ['read', 'Read & explore', 'learn']] },
    { id: 'minutes', q: 'How long each day?', options: [[15, '15 minutes', 'zap'], [30, '30 minutes', 'flame']] },
  ],
  owner: [
    { id: 'business', q: 'What kind of business do you run?', options: [['products', 'I sell products', 'package'], ['services', 'I offer services', 'heart'], ['food', 'Food & drink', 'store'], ['online', 'Online shop', 'phone'], ['idea', 'Not started yet', 'ideas']] },
    { id: 'level', q: 'Where are you now?', options: [['starter', 'Just starting out', 'leaf'], ['growing', 'Some regular customers', 'rocket'], ['advanced', 'Established, ready to grow', 'crown']] },
    { id: 'goal', q: 'Your #1 goal right now?', options: [['customers', 'Get more customers', 'users', 'local'], ['loyal', 'Keep customers coming back', 'heart', 'customers'], ['profit', 'Better prices & profit', 'coins', 'money'], ['online', 'Get found online', 'search', 'online'], ['brand', 'Build a stronger brand', 'palette', 'brand']] },
    { id: 'interests', q: 'What else should we focus on? Pick up to 3.', multi: 3, options: [['social', 'Social media', 'phone'], ['video', 'Video & photos', 'studio'], ['local', 'Local & events', 'tent'], ['online', 'Online selling', 'package'], ['data', 'Numbers & testing', 'chart'], ['rules', 'Staying legal & honest', 'scale']] },
    { id: 'format', q: 'How do you prefer to learn?', options: [['shorts', 'Quick shorts', 'studio'], ['swipe', 'Swipe cards', 'phone'], ['read', 'In-depth reading', 'learn']] },
    { id: 'minutes', q: 'Time per day?', options: [[15, '15 minutes', 'zap'], [30, '30 minutes', 'flame']] },
  ],
  pro: [
    { id: 'business', q: 'What best describes you?', options: [['inhouse', 'Marketer at a company', 'store'], ['agency', 'Freelancer or agency', 'ambassador'], ['founder', 'Founder', 'rocket'], ['student', 'Student / career switcher', 'grad']] },
    { id: 'level', q: 'Marketing experience?', options: [['starter', 'Under 1 year', 'leaf'], ['growing', '1–3 years', 'rocket'], ['advanced', '3+ years', 'crown']] },
    { id: 'goal', q: 'What do you most want to sharpen?', options: [['strategy', 'Strategy & planning', 'compass', 'money'], ['measure', 'Measurement & testing', 'chart', 'data'], ['creative', 'Creative & content', 'palette', 'video'], ['compliance', 'Compliance & trust', 'scale', 'rules']] },
    { id: 'interests', q: 'Also focus on (up to 3):', multi: 3, options: [['online', 'SEO & conversion', 'search'], ['social', 'Social & content', 'phone'], ['customers', 'Retention & CX', 'heart'], ['local', 'Local & partnerships', 'tent'], ['brand', 'Brand & storytelling', 'palette'], ['data', 'Analytics', 'chart']] },
    { id: 'format', q: 'Preferred format?', options: [['shorts', 'Shorts first', 'studio'], ['swipe', 'Swipe cards', 'phone'], ['read', 'In-depth reading', 'learn']] },
    { id: 'minutes', q: 'Daily time budget?', options: [[15, '15 minutes', 'zap'], [30, '30 minutes', 'flame']] },
  ],
};

/** Turn quiz answers into a clean profile (unknown values are dropped). */
export function profileFromAnswers(role, answers = {}) {
  const track = trackFor(role);
  const quiz = QUIZ[track];
  const pick = (id) => {
    const q = quiz.find((x) => x.id === id);
    if (!q) return undefined;
    const ok = q.options.map((o) => o[0]);
    if (q.multi) return (Array.isArray(answers[id]) ? answers[id] : []).filter((v) => ok.includes(v)).slice(0, q.multi);
    return ok.includes(answers[id]) ? answers[id] : undefined;
  };
  const goal = pick('goal');
  const goalTopic = quiz.find((x) => x.id === 'goal')?.options.find((o) => o[0] === goal)?.[3] ?? null;
  return {
    track,
    goal: goal ?? null,
    goalTopic,
    business: pick('business') ?? null,
    level: pick('level') ?? 'starter',
    interests: pick('interests') ?? [],
    format: pick('format') ?? (track === 'kid' ? 'shorts' : 'swipe'),
    minutes: pick('minutes') ?? 15,
  };
}

const topicOf = (slug) => Object.keys(TOPICS).filter((t) => TOPICS[t].slugs.includes(slug));

/** Ordered lesson slugs for this learner: month-plan weeks kept, focus topics first inside each week. */
export function courseOrder(profile, visibleSlugs) {
  const focus = new Set([profile.goalTopic, ...(profile.interests ?? [])].filter(Boolean));
  const visible = new Set(visibleSlugs);
  return MONTH_PLAN.flatMap((w) =>
    w.slugs
      .filter((s) => visible.has(s))
      .map((s, i) => ({ s, i, f: topicOf(s).some((t) => focus.has(t)) ? 0 : 1 }))
      .sort((a, b) => a.f - b.f || a.i - b.i)
      .map((x) => ({ slug: x.s, week: w.week, theme: w.theme, focus: x.f === 0 })),
  );
}

export const STEP_IDS = ['short', 'lesson', 'decide', 'review', 'project'];
export const REQUIRED_STEPS = ['short', 'lesson', 'decide', 'project'];

/**
 * Builds the course with unlock state.
 * @param user  { completedLessons, scenariosDone, reviewLast, course: { startedAt, days: { [n]: { short, project, review, doneAt } } }, personal }
 * @param lessons visible lessons [{ id, slug, title, estimatedMinutes, hasScenario }]
 */
export function buildCourse(user, lessons, now = new Date()) {
  const profile = user.personal ?? profileFromAnswers(user.role, {});
  const today = dayKey(now);
  const bySlug = new Map(lessons.map((l) => [l.slug, l]));
  const order = courseOrder(profile, lessons.map((l) => l.slug));
  const progress = user.course?.days ?? {};
  const days = [];
  let unlockedNext = true;
  for (let i = 0; i < order.length; i++) {
    const n = i + 1;
    const o = order[i];
    const l = bySlug.get(o.slug);
    const rec = progress[n] ?? {};
    const steps = {
      short: Boolean(rec.short),
      lesson: user.completedLessons?.includes(l.id) ?? false,
      decide: !l.hasScenario || (user.scenariosDone?.includes(l.id) ?? false),
      review: Boolean(rec.review),
      project: Boolean(rec.project),
    };
    const complete = REQUIRED_STEPS.every((k) => steps[k]);
    const doneAt = rec.doneAt ?? null;
    const unlocked = unlockedNext;
    // the next day opens only after this one is done on an earlier calendar day
    unlockedNext = unlocked && Boolean(doneAt) && doneAt < today;
    const quick = profile.level === 'advanced' && o.week === 1;
    const p = PROJECTS[o.slug] ?? {};
    days.push({
      day: n,
      week: o.week,
      theme: o.theme,
      focus: o.focus,
      quick,
      lessonId: l.id,
      slug: o.slug,
      title: l.title,
      steps,
      complete,
      readyToMark: complete && !doneAt,
      doneAt,
      unlocked,
      project: { text: p[profile.track] ?? p.owner ?? 'Apply one idea from today\'s lesson to your own business.', to: p.to ?? null },
      minutes: sessionMinutes(profile, l, n),
    });
  }
  const done = days.filter((d) => d.doneAt).length;
  const current = days.find((d) => d.unlocked && !d.doneAt) ?? null;
  const nextUnlock = !current && done < days.length ? 'tomorrow' : null;
  return { profile, today, days, total: days.length, done, current, nextUnlock, finished: done === days.length && days.length > 0 };
}

/** Estimated minutes for a day's session in the learner's chosen format. */
export function sessionMinutes(profile, lesson, dayNumber) {
  const est = lesson.estimatedMinutes ?? 8;
  const lessonMin = profile.format === 'read' ? est : Math.max(3, Math.round(est * 0.45));
  const short = 3;
  const decide = 3;
  const review = dayNumber > 1 ? 2 : 0;
  const project = profile.minutes >= 30 ? 12 : 5;
  return short + lessonMin + decide + review + project;
}

/** Marks a self-reported step (short, review, project) and closes the day when it's complete. */
export function markStep(user, course, dayNumber, step, now = new Date()) {
  const d = course.days.find((x) => x.day === dayNumber);
  if (!d || !d.unlocked) return { error: 'That day isn\'t open yet. A new day unlocks each day.' };
  if (!['short', 'review', 'project'].includes(step)) return { error: 'Unknown step.' };
  const days = { ...(user.course?.days ?? {}) };
  const rec = { ...(days[dayNumber] ?? {}), [step]: true };
  const steps = { ...d.steps, [step]: true };
  const complete = REQUIRED_STEPS.every((k) => steps[k]);
  const justFinished = complete && !rec.doneAt;
  if (justFinished) rec.doneAt = dayKey(now);
  days[dayNumber] = rec;
  return { patch: { course: { startedAt: user.course?.startedAt ?? dayKey(now), days } }, justFinished };
}

/** Closes a day whose required steps were completed elsewhere (lesson quiz, scenario). */
export function closeCompletedDays(user, course, now = new Date()) {
  const ready = course.days.filter((d) => d.readyToMark && d.unlocked);
  if (!ready.length) return null;
  const days = { ...(user.course?.days ?? {}) };
  for (const d of ready) days[d.day] = { ...(days[d.day] ?? {}), doneAt: dayKey(now) };
  return { course: { startedAt: user.course?.startedAt ?? dayKey(now), days } };
}
