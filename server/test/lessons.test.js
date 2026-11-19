import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LESSONS } from '../src/seed.js';
import { EXTRA_LESSONS } from '../src/lessons-extra.js';
import { PRO_LESSONS } from '../src/lessons-pro.js';
import { MONTH_LESSONS } from '../src/lessons-month.js';
import { MONTH_PLAN } from '../../client/src/lib/monthPlan.js';

const all = [...LESSONS, ...EXTRA_LESSONS, ...PRO_LESSONS, ...MONTH_LESSONS];

test('course has at least a month of lessons for every audience', () => {
  for (const role of ['kid', 'adult', 'professional']) {
    const n = all.filter((l) => l.audiences.includes(role)).length;
    assert.ok(n >= 30, `${role} sees only ${n} lessons`);
  }
});

test('lessons are well-formed and every citation points at a real source', () => {
  const slugs = new Set();
  for (const l of all) {
    assert.ok(!slugs.has(l.slug), `duplicate slug ${l.slug}`);
    slugs.add(l.slug);
    assert.ok(l.sources.length > 0, `${l.slug} has no sources`);
    for (const s of l.sources) assert.match(s.url, /^https:\/\//, `${l.slug} source url`);
    for (const sec of l.sections) for (const r of sec.sourceRefs ?? []) assert.ok(r >= 0 && r < l.sources.length, `${l.slug}: bad sourceRef ${r}`);
    for (const q of l.quiz) assert.ok(q.answerIndex >= 0 && q.answerIndex < q.options.length, `${l.slug}: bad quiz answer`);
  }
});

test('month plan covers every staff lesson exactly once', () => {
  const planned = MONTH_PLAN.flatMap((w) => w.slugs);
  assert.equal(new Set(planned).size, planned.length, 'a lesson appears twice in the plan');
  assert.deepEqual([...planned].sort(), all.map((l) => l.slug).sort());
});
