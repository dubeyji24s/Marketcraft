// The Marketcraft month: a guided order through the staff lessons, about one lesson a day.
// The order itself lives in the shared play rules so the server can suggest "today's lesson" too.
// Lessons a learner can't see (for example adult-only ones on a kid account) are skipped.
import { MONTH_PLAN } from '@play';

export { MONTH_PLAN };

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
