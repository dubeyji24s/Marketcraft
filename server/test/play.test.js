// Streaks, daily missions, swipe lessons, the Idea Board and the junior medal.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'mc-play-'));
process.env.DATA_FILE = path.join(tmp, 'db.json');
process.env.UPLOAD_DIR = path.join(tmp, 'uploads');
delete process.env.ANTHROPIC_API_KEY;
process.env.FIREBASE_PROJECT_ID = 'demo-marketcraft';
process.env.ADMIN_EMAILS = 'teacher@school.edu';

const { createApp } = await import('../src/app.js');
const { seed } = await import('../src/seed.js');
const { db } = await import('../src/db.js');
const { setTokenVerifier } = await import('../src/firebase.js');
const rules = await import('../src/play/rules.js');

setTokenVerifier(async (t) => ({ auth_time: Math.floor(Date.now() / 1000), email_verified: true, ...JSON.parse(t) }));
const token = (c) => JSON.stringify(c);

let server, base;
before(async () => {
  await seed();
  server = createApp().listen(0);
  base = `http://127.0.0.1:${server.address().port}/api`;
});
after(() => server.close());

function client() {
  let cookie = '';
  return async (method, url, body, isForm) => {
    const res = await fetch(base + url, {
      method,
      headers: { cookie, ...(body && !isForm ? { 'content-type': 'application/json' } : {}) },
      body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
    });
    const set = res.headers.get('set-cookie');
    if (set) cookie = set.split(';')[0];
    return { status: res.status, body: await res.json().catch(() => null) };
  };
}
async function kidClient(uid) {
  const api = client();
  const r = await api('POST', '/auth/session', { idToken: token({ uid, email: `${uid}@family.com` }), profile: { name: 'Leo', role: 'kid', ageGroup: 'under13', parentAccount: true, guardianConsent: true } });
  assert.equal(r.status, 200);
  return api;
}
async function adultClient(uid, email = `${uid}@x.com`) {
  const api = client();
  const r = await api('POST', '/auth/session', { idToken: token({ uid, email }), profile: { name: 'Ava', role: 'adult', adultConfirmed: true } });
  assert.equal(r.status, 200);
  return api;
}

test('streaks count days, forgive one missed day a week, and reset after longer gaps', () => {
  let s = rules.nextStreak({}, '2026-11-01');
  assert.equal(s.count, 1);
  assert.equal(rules.nextStreak(s, '2026-11-01').count, 1, 'same day does not double count');
  s = rules.nextStreak(s, '2026-11-02');
  assert.equal(s.count, 2);
  s = rules.nextStreak(s, '2026-11-04'); // missed the 3rd: freeze used
  assert.equal(s.count, 3);
  assert.equal(s.freezeUsedOn, '2026-11-04');
  s = rules.nextStreak(s, '2026-11-06'); // missed again within a week: reset
  assert.equal(s.count, 1);
  assert.equal(s.best, 3);
  assert.equal(rules.liveStreak({ count: 5, last: '2026-11-01', best: 5 }, '2026-11-10').count, 0);
});

test('one mission a day, rewarded once', () => {
  const user = { id: 'u1', role: 'kid', streak: {}, today: null };
  const now = new Date('2026-11-20T10:00:00');
  const m = rules.missionFor(user, rules.dayKey(now));
  assert.equal(rules.missionFor(user, rules.dayKey(now)).id, m.id, 'stable for the day');
  const other = rules.MISSIONS.find((x) => x.kind !== m.kind).kind;
  const a = rules.applyActivity(user, other, now);
  assert.equal(a.bonusXp, 0);
  Object.assign(user, a.patch);
  const b = rules.applyActivity(user, m.kind, now);
  assert.equal(b.bonusXp, rules.MISSION_XP);
  Object.assign(user, b.patch);
  assert.equal(rules.applyActivity(user, m.kind, now).bonusXp, 0, 'only once');
});

test('today summary, swipe lessons and lesson quizzes build the streak', async () => {
  const kid = await kidClient('play-kid');
  const t = await kid('GET', '/play/today');
  assert.equal(t.status, 200);
  assert.equal(t.body.streak.count, 0);
  assert.equal(t.body.nextLesson.day, 1);
  assert.equal(t.body.level.title, 'Idea Sprout');
  const lessonId = t.body.nextLesson.id;
  const c = await kid('POST', `/play/cards/${lessonId}`);
  assert.equal(c.status, 200);
  assert.equal(c.body.xpEarned, 10);
  assert.equal(c.body.play.streak, 1);
  assert.equal((await kid('POST', `/play/cards/${lessonId}`)).body.xpEarned, 0, 'swipe XP once per lesson');
  const after = await kid('GET', '/play/today');
  assert.equal(after.body.streak.count, 1);
  assert.equal(after.body.streak.activeToday, true);
  assert.equal(after.body.cardsDone, 1);
  assert.equal((await kid('POST', '/play/cards/nope')).status, 404);
});

test('Idea Board: steps reward XP once, finishing all steps earns a badge, ideas stay private', async () => {
  const kid = await kidClient('idea-kid');
  const other = await adultClient('idea-adult');
  const created = await kid('POST', '/play/ideas', { name: 'Lemon Zoom', what: 'Fresh lemonade on my street', emoji: '🍋' });
  assert.equal(created.status, 201);
  assert.equal(created.body.xpEarned, rules.IDEA_STEP_XP);
  assert.equal(created.body.idea.progress.done, 1);
  const id = created.body.idea.id;
  const full = { name: 'Lemon Zoom', what: 'Fresh lemonade on my street', emoji: '🍋', who: ['Neighbours'], special: 'Real lemons and mint', cost: 0.5, price: 2, channels: ['Poster'], slogan: 'Zoom into summer!' };
  const done = await kid('PUT', `/play/ideas/${id}`, full);
  assert.equal(done.body.xpEarned, 5 * rules.IDEA_STEP_XP);
  assert.ok(done.body.newBadges.some((b) => b.key === 'idea-builder'));
  assert.equal((await kid('PUT', `/play/ideas/${id}`, full)).body.xpEarned, 0, 'no XP for re-saving');
  assert.equal((await other('PUT', `/play/ideas/${id}`, full)).status, 404, 'other users cannot edit');
  assert.equal((await other('GET', '/play/ideas')).body.ideas.length, 0);
  assert.equal((await kid('POST', '/play/ideas', { picture: 'data:text/html;base64,AAAA' })).status, 400, 'only images');
  assert.equal((await kid('DELETE', `/play/ideas/${id}`)).status, 200);
});

test('junior medal: needs 1,000 unique views, a parent-confirmed address, admin approval; address deleted once shipped', async () => {
  const kid = await kidClient('medal-kid');
  const adult = await adultClient('medal-adult');
  const admin = await adultClient('medal-admin', 'teacher@school.edu');

  const f = new FormData();
  f.set('title', 'My cookie stand ad'); f.set('videoUrl', 'https://youtu.be/abc123xyz'); f.set('visibility', 'community');
  const post = await kid('POST', '/showcase', f, true);
  const vid = post.body.item.id;
  await admin('POST', `/showcase/${vid}/review`, { status: 'approved' });

  // views: unique viewers only, never the owner
  assert.equal((await kid('POST', `/showcase/${vid}/view`)).body.views, 0);
  assert.equal((await adult('POST', `/showcase/${vid}/view`)).body.views, 1);
  assert.equal((await adult('POST', `/showcase/${vid}/view`)).body.views, 1);

  const shipping = { recipientName: 'Sam Parent', line1: '1 Main St', city: 'Springfield', postalCode: '12345', country: 'USA' };
  const early = await kid('POST', '/showcase/medal/claim', { showcaseId: vid, source: 'marketcraft', parentConfirm: true, shipping });
  assert.equal(early.status, 400, 'not enough views yet');
  assert.match(early.body.error, /1 of 1000/);
  assert.equal((await adult('POST', '/showcase/medal/claim', { showcaseId: vid, source: 'marketcraft', parentConfirm: true, shipping })).status, 403, 'juniors only');

  await db.update('showcase', vid, { viewers: Array.from({ length: 1000 }, (_, i) => `viewer-${i}`) });
  assert.equal((await kid('POST', '/showcase/medal/claim', { showcaseId: vid, source: 'marketcraft', shipping })).status, 400, 'parent must confirm');
  const claim = await kid('POST', '/showcase/medal/claim', { showcaseId: vid, source: 'marketcraft', parentConfirm: true, shipping });
  assert.equal(claim.status, 201);
  assert.equal(claim.body.claim.shipTo.line1, undefined, 'learner view never echoes the full address');
  assert.equal((await kid('POST', '/showcase/medal/claim', { showcaseId: vid, source: 'marketcraft', parentConfirm: true, shipping })).status, 409);

  assert.equal((await adult('GET', '/showcase/medal/claims')).status, 403);
  const list = await admin('GET', '/showcase/medal/claims');
  assert.equal(list.body.claims[0].shipTo.line1, '1 Main St', 'admin sees the address to post the medal');
  const shipped = await admin('POST', `/showcase/medal/claims/${claim.body.claim.id}`, { status: 'shipped' });
  assert.equal(shipped.body.claim.shipTo, null, 'address deleted after shipping');
  assert.equal(db.get('medals', claim.body.claim.id).shipping, null);
  const me = await kid('GET', '/showcase/medal/status');
  assert.equal(me.body.claim.status, 'shipped');
  const dash = await kid('GET', '/studio/dashboard');
  assert.ok(dash.body.user.badges.includes('medal'));
});
