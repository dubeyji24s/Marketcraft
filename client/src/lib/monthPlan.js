// The Marketcraft month: a guided order through the staff lessons, about one lesson a day.
// Lessons a learner can't see (for example adult-only ones on a kid account) are skipped.
export const MONTH_PLAN = [
  { week: 1, theme: 'Foundations', emoji: '🧭', slugs: ['know-your-customer', 'market-research-free', 'brand-identity', 'story-that-sells', 'word-of-mouth', 'honest-marketing', 'pricing-for-profit'] },
  { week: 2, theme: 'Words, pictures & video', emoji: '🎬', slugs: ['words-that-get-read', 'call-to-action', 'phone-product-photos', 'pitch-video-basics', 'video-abcd', 'accessible-marketing', 'social-media-that-sells'] },
  { week: 3, theme: 'Get found & plan ahead', emoji: '🗓️', slugs: ['google-business-profile', 'seo-basics', 'content-calendar', 'email-list-from-zero', 'markets-and-events', 'partner-up', 'one-page-marketing-plan'] },
  { week: 4, theme: 'Trust & happy customers', emoji: '🤝', slugs: ['honest-reviews', 'bad-reviews', 'effortless-service', 'keep-your-customers', 'customer-journey', 'truth-in-advertising', 'honest-green-claims'] },
  { week: 5, theme: 'Grow & protect', emoji: '🚀', slugs: ['disclose-like-a-pro', 'selling-online-promises', 'protect-your-business', 'launch-plan', 'track-what-works', 'test-and-improve', 'first-ad-budget', 'marketing-and-kids-privacy'] },
];

/** Builds the learner's plan from the lessons they can see. */
export function buildPlan(lessons) {
  const bySlug = new Map(lessons.filter((l) => l.slug).map((l) => [l.slug, l]));
  let day = 0;
  const weeks = MONTH_PLAN.map((w) => ({
    ...w,
    days: w.slugs.filter((s) => bySlug.has(s)).map((s) => ({ day: ++day, lesson: bySlug.get(s) })),
  })).filter((w) => w.days.length);
  const all = weeks.flatMap((w) => w.days);
  const done = all.filter((d) => d.lesson.completed).length;
  const next = all.find((d) => !d.lesson.completed) ?? null;
  return { weeks, total: all.length, done, next };
}
