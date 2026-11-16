// End-to-end API test in offline-demo mode (no API key needed).
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'mc-test-'));
process.env.DATA_FILE = path.join(tmp, 'db.json');
process.env.UPLOAD_DIR = path.join(tmp, 'uploads');
delete process.env.ANTHROPIC_API_KEY;
delete process.env.ANTHROPIC_AUTH_TOKEN;
process.env.FIREBASE_PROJECT_ID = 'demo-marketcraft';
process.env.ADMIN_EMAILS = 'teacher@school.edu';

const { createApp } = await import('../src/app.js');
const { seed } = await import('../src/seed.js');
const { checkOriginality } = await import('../src/ai/originality.js');
const { toEmbedUrl } = await import('../src/uploads.js');
const { setTokenVerifier } = await import('../src/firebase.js');

// Stub Firebase: a "token" is JSON describing the decoded claims.
setTokenVerifier(async (t) => {
  if (!t.startsWith('{')) throw new Error('invalid token');
  return { auth_time: Math.floor(Date.now() / 1000), email_verified: true, firebase: { sign_in_provider: 'password' }, ...JSON.parse(t) };
});
const token = (claims) => JSON.stringify({ padding: 'x'.repeat(20), ...claims });

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

test('kid signup requires guardian consent', async () => {
  const api = client();
  const idToken = token({ uid: 'kid1', email: 'kid@x.com' });
  const r = await api('POST', '/auth/session', { idToken, profile: { name: 'Kiddo', role: 'kid' } });
  assert.equal(r.status, 400);
  const noAge = await api('POST', '/auth/session', { idToken, profile: { name: 'Kiddo', role: 'kid', parentAccount: true, guardianConsent: true } });
  assert.equal(noAge.status, 400);
  const teenOwn = await api('POST', '/auth/session', { idToken, profile: { name: 'Kiddo', role: 'kid', ageGroup: 'teen', guardianConsent: true } });
  assert.equal(teenOwn.status, 400, 'teens also need a parent account');
  const ok = await api('POST', '/auth/session', { idToken, profile: { name: 'Kiddo', role: 'kid', ageGroup: 'teen', parentAccount: true, guardianConsent: true } });
  assert.equal(ok.status, 200);
  assert.equal(ok.body.user.role, 'kid');
  assert.equal(ok.body.user.firebaseUid, undefined, 'uid not leaked');
});

test('kids must use a parent account; adults confirm 18+', async () => {
  const api = client();
  const idToken = token({ uid: 'parent1', email: 'parent@x.com' });
  const own = await api('POST', '/auth/session', { idToken, profile: { name: 'Leo', role: 'kid', ageGroup: 'under13', guardianConsent: true } });
  assert.equal(own.status, 400, 'must confirm it is the parent account');
  const ok = await api('POST', '/auth/session', { idToken, profile: { name: 'Leo', role: 'kid', ageGroup: 'under13', parentAccount: true, guardianConsent: true, parentName: 'Sam' } });
  assert.equal(ok.status, 200);
  assert.equal(ok.body.user.accountHolder, 'parent');
  assert.equal(ok.body.user.guardianEmail, 'parent@x.com', 'guardian is the account owner');
  assert.equal(ok.body.user.name, 'Leo', 'child name goes on certificates');
  const adult = client();
  const t = token({ uid: 'adult-x', email: 'adult@x.com' });
  assert.equal((await adult('POST', '/auth/session', { idToken: t, profile: { name: 'Al', role: 'adult' } })).status, 400, 'must confirm 18+');
  assert.equal((await adult('POST', '/auth/session', { idToken: t, profile: { name: 'Al', role: 'adult', adultConfirmed: true } })).status, 200);
});

test('firebase session rules', async () => {
  const api = client();
  assert.equal((await api('POST', '/auth/session', { idToken: 'not-a-real-token-at-all-xx' })).status, 401);
  // existing Firebase account without a profile (e.g. first Google sign-in) → onboarding
  const g = await api('POST', '/auth/session', { idToken: token({ uid: 'g1', email: 'g@x.com', name: 'Gina G' }) });
  assert.equal(g.status, 404);
  assert.equal(g.body.needsProfile, true);
  assert.equal(g.body.suggestedName, 'Gina G');
  // stale sign-in can't start a new session
  const stale = await api('POST', '/auth/session', { idToken: token({ uid: 'g1', auth_time: 1 }), profile: { name: 'Gina', role: 'adult', adultConfirmed: true } });
  assert.equal(stale.status, 401);
  // admin role only from ADMIN_EMAILS with a verified email
  const t = client();
  const unverified = await t('POST', '/auth/session', { idToken: token({ uid: 't1', email: 'teacher@school.edu', email_verified: false }), profile: { name: 'Teach', role: 'professional', adultConfirmed: true } });
  assert.equal(unverified.body.user.role, 'professional');
  const verified = await t('POST', '/auth/session', { idToken: token({ uid: 't1', email: 'teacher@school.edu', email_verified: true, auth_time: 1 }) });
  assert.equal(verified.status, 200, 'refreshing an existing session skips the freshness check');
  assert.equal(verified.body.user.role, 'admin');
  assert.equal((await t('GET', '/lessons')).status, 200);
  // name used on certificates is editable
  assert.equal((await t('PATCH', '/auth/profile', { name: 'Ms. Teach' })).body.user.name, 'Ms. Teach');
  await t('POST', '/auth/logout');
  assert.equal((await t('GET', '/auth/me')).body.user, null);
});

test('auth, lessons, fail → retry → pass → certificate', async () => {
  const api = client();
  assert.equal((await api('GET', '/auth/me')).body.user, null);
  assert.equal((await api('GET', '/studio/dashboard')).status, 401);
  const s = await api('POST', '/auth/session', { idToken: token({ uid: 'ada', email: 'ada@x.com' }), profile: { name: 'Ada Owner', role: 'adult', adultConfirmed: true } });
  assert.equal(s.status, 200);

  const lessons = await api('GET', '/lessons');
  assert.ok(lessons.body.lessons.length >= 3);
  const lesson = await api('GET', `/lessons/${lessons.body.lessons[0].id}`);
  assert.equal(lesson.body.lesson.quiz[0].answerIndex, undefined, 'answers hidden');
  const done = await api('POST', `/lessons/${lesson.body.lesson.id}/complete`, { answers: [1, 1] });
  assert.ok(done.body.xpEarned > 0);

  const { body } = await api('GET', '/studio/challenges');
  const ch = body.challenges[0];

  const weak = new FormData();
  weak.set('challengeId', ch.id);
  weak.set('channel', 'social');
  weak.set('videoUrl', 'https://youtu.be/abc123xyz');
  weak.set('explanation', 'I will make a video about my product and post it online for people.');
  const r1 = await api('POST', '/studio/submissions', weak, true);
  assert.equal(r1.status, 201, JSON.stringify(r1.body));
  assert.equal(r1.body.submission.evaluation.passed, false);
  assert.equal(r1.body.certificate, null);
  assert.equal(r1.body.submission.evaluation.mode, 'offline-demo');

  const strong = new FormData();
  strong.set('challengeId', ch.id);
  strong.set('channel', 'outdoor');
  strong.set('videoUrl', 'https://youtu.be/abc123xyz');
  strong.set(
    'explanation',
    'First, a hook: I show a close-up of ice clinking in the lemonade with bright color captions. Then I name the problem: parents at the park are hot and tired, and kids want a treat. My target customer is local families and neighbors who walk by on Saturday. The benefit is a cold drink for $1, and the first 20 cups are a free refill, which makes us unique. Finally, my call to action: visit the stand by the big sign today and buy before noon. I will film in good lighting with a clean background and a flyer in frame so people remember the sign.',
  );
  const r2 = await api('POST', '/studio/submissions', strong, true);
  assert.equal(r2.status, 201);
  assert.equal(r2.body.submission.attempt, 2);
  assert.ok(r2.body.submission.evaluation.passed, `score ${r2.body.submission.evaluation.percent}`);
  assert.ok(r2.body.certificate.verifyCode);
  assert.ok(r2.body.newBadges.some((b) => b.key === 'comeback'));

  const verify = await fetch(`${base}/studio/certificates/verify/${r2.body.certificate.verifyCode}`).then((r) => r.json());
  assert.equal(verify.valid, true);
  assert.equal(verify.recipientName, 'Ada Owner');

  // other users cannot read the certificate
  const other = client();
  await other('POST', '/auth/session', { idToken: token({ uid: 'eve', email: 'eve@x.com' }), profile: { name: 'Eve', role: 'adult', adultConfirmed: true } });
  assert.equal((await other('GET', `/studio/certificates/${r2.body.certificate.id}`)).status, 404);
  // learners cannot use admin endpoints
  assert.equal((await other('POST', '/interviews/summarize', { title: 'x', transcript: 'y' })).status, 403);

  // ---- Ambassador Program ----
  // not certified → locked
  assert.equal((await other('GET', '/ambassador/status')).body.eligible, false);
  assert.equal((await other('POST', '/ambassador/join', { agreeGuidelines: true })).status, 403);
  assert.equal((await other('POST', '/ambassador/tools/social-post', { inputs: {} })).status, 403);
  assert.ok(!(await other('GET', '/studio/challenges')).body.challenges.some((c) => c.kind === 'ambassador'), 'mission hidden');

  // certified → can join, gets referral code
  assert.equal((await api('GET', '/ambassador/status')).body.company.name, 'Partner Website', 'learners see the public label');
  const st = await api('GET', '/ambassador/status');
  assert.equal(st.body.eligible, true);
  assert.equal(st.body.tools.length, 6);
  assert.ok(st.body.tools.every((t) => t.howTo.length && t.whatItDoes && t.proTip));
  assert.equal((await api('POST', '/ambassador/join', {})).status, 400, 'must agree to guidelines');
  const joined = await api('POST', '/ambassador/join', { agreeGuidelines: true });
  assert.equal(joined.status, 201);
  assert.match(joined.body.ambassador.code, /^[A-Z2-9]{8}$/);
  assert.ok(joined.body.newBadges.some((b) => b.key === 'ambassador'));

  // tool input validation, then AI-off message
  assert.equal((await api('POST', '/ambassador/tools/social-post', { inputs: { platform: 'Myspace' } })).status, 400);
  assert.equal((await api('POST', '/ambassador/tools/nope', { inputs: {} })).status, 404);
  const tool = await api('POST', '/ambassador/tools/compliance-check', { inputs: { draft: 'Check out this app! #ad', platform: 'Instagram' } });
  assert.equal(tool.status, 503);

  // mission requires the company brief
  const mission = (await api('GET', '/studio/challenges')).body.challenges.find((c) => c.kind === 'ambassador');
  assert.ok(mission);
  const m = new FormData();
  m.set('challengeId', mission.id);
  m.set('channel', 'social');
  m.set('videoUrl', 'https://youtu.be/abc123xyz');
  m.set('explanation', strong.get('explanation') + ' I add #ad and say I am a brand ambassador, and only share honest facts from the brand brief with my referral link.');
  assert.equal((await api('POST', '/studio/submissions', m, true)).status, 409);

  // admin fills the brief (admin = verified ADMIN_EMAILS)
  const admin = client();
  await admin('POST', '/auth/session', { idToken: token({ uid: 'adm', email: 'teacher@school.edu' }), profile: { name: 'Teacher', role: 'professional', adultConfirmed: true } });
  assert.equal((await api('PUT', '/ambassador/brief', { name: 'x' })).status, 403);
  const brief = { displayName: 'Partner Website', name: 'SecretCo', website: 'https://partner.example', tagline: '', description: 'Trend insights', products: '', audience: '', keyMessages: '', offers: '', voice: '', dos: '', donts: '', hashtags: '#AlphaTrend' };
  assert.equal((await admin('PUT', '/ambassador/brief', brief)).status, 200);
  const st2 = (await api('GET', '/ambassador/status')).body;
  assert.equal(st2.company.name, 'Partner Website', 'real name stays private');
  assert.ok(!JSON.stringify(st2).includes('SecretCo'));
  assert.match(st2.referralLink, /^https:\/\/partner\.example\/\?ref=[A-Z2-9]{8}&utm_source=marketcraft/);
  assert.equal(st2.mission.title, 'Ambassador Mission: Grow the Partner Website');

  const pass = await api('POST', '/studio/submissions', m, true);
  assert.equal(pass.status, 201, JSON.stringify(pass.body));
  const ev = pass.body.submission.evaluation;
  assert.equal(ev.criteria.length, 5, 'ambassador rubric has brand criterion');
  assert.equal(ev.max, 100);
  assert.ok(ev.passed, `mission score ${ev.percent}`);
  assert.equal(pass.body.certificate.badge, 'Certified Brand Ambassador');
  assert.equal(pass.body.certificate.kind, 'ambassador');
  assert.ok((await admin('GET', '/ambassador/roster')).body.ambassadors.some((a) => a.name === 'Ada Owner' && a.missionCertified));

  // ---- Marketing Lab: locked for others, unlocked by the Ambassador certificate ----
  assert.equal((await other('GET', '/lab/status')).body.unlocked, false);
  assert.equal((await other('PUT', '/lab/brand', { name: 'x' })).status, 403);
  const lab = await api('GET', '/lab/status');
  assert.equal(lab.body.unlocked, true);
  assert.equal(lab.body.tools.length, 6);
  assert.equal((await api('POST', '/lab/tools/social-post', { inputs: { platform: 'Instagram', topic: 'my scarves', goal: 'Build awareness' } })).status, 409, 'brand first');
  const emptyBrand = Object.fromEntries(['name', 'website', 'tagline', 'description', 'products', 'audience', 'keyMessages', 'offers', 'voice', 'dos', 'donts', 'hashtags'].map((k) => [k, '']));
  assert.equal((await api('PUT', '/lab/brand', { ...emptyBrand, website: 'not a link' })).status, 400);
  const saved = await api('PUT', '/lab/brand', { ...emptyBrand, name: "Ada's Sourdough", description: 'Small-batch bread', website: 'https://ada.example' });
  assert.equal(saved.status, 200);
  assert.ok(saved.body.newBadges.some((b) => b.key === 'lab'));
  assert.equal((await api('POST', '/lab/tools/social-post', { inputs: { platform: 'Instagram', topic: 'my bread', goal: 'Build awareness' } })).status, 503, 'AI off in tests');
  const doc = { width: 1080, height: 1080, preset: 'instagram-post', background: { type: 'solid', color: '#fff' }, elements: [{ id: 'a', type: 'text', text: 'Hi' }] };
  const d = await api('POST', '/lab/designs', { name: 'Promo', doc });
  assert.equal(d.status, 201);
  assert.equal(d.body.design.preset, 'instagram-post');
  assert.equal((await other('GET', `/lab/designs/${d.body.design.id}`)).status, 403);
  assert.equal((await api('PUT', `/lab/designs/${d.body.design.id}`, { name: 'Promo v2', doc })).body.design.name, 'Promo v2');
  assert.equal((await api('GET', '/lab/designs')).body.designs.length, 1);
  assert.equal((await api('DELETE', `/lab/designs/${d.body.design.id}`)).status, 200);
});

test('showcase: private by default, community posts need admin approval', async () => {
  const alice = client();
  await alice('POST', '/auth/session', { idToken: token({ uid: 'sc-a', email: 'a@sc.com' }), profile: { name: 'Alice', role: 'adult', adultConfirmed: true } });
  const bob = client();
  await bob('POST', '/auth/session', { idToken: token({ uid: 'sc-b', email: 'b@sc.com' }), profile: { name: 'Bob', role: 'professional', adultConfirmed: true } });
  const admin = client();
  await admin('POST', '/auth/session', { idToken: token({ uid: 'adm', email: 'teacher@school.edu' }), profile: { name: 'Teacher', role: 'professional', adultConfirmed: true } });

  const f = new FormData();
  f.set('title', 'My bakery reel'); f.set('videoUrl', 'https://youtu.be/abc123xyz'); f.set('visibility', 'community'); f.set('tags', '#Bakery, local');
  const post = await alice('POST', '/showcase', f, true);
  assert.equal(post.status, 201);
  assert.equal(post.body.item.status, 'pending');
  assert.deepEqual(post.body.item.tags, ['bakery', 'local']);
  assert.ok(post.body.newBadges.some((b) => b.key === 'showcase'));
  assert.equal((await bob('GET', '/showcase')).body.items.length, 0, 'pending is hidden from others');
  assert.equal((await alice('GET', '/showcase?scope=mine')).body.items.length, 1);
  assert.equal((await bob('POST', `/showcase/${post.body.item.id}/cheer`)).status, 404);
  assert.equal((await bob('GET', '/showcase/review/queue')).status, 403);

  const q = await admin('GET', '/showcase/review/queue');
  assert.equal(q.body.items.length, 1);
  assert.equal((await admin('POST', `/showcase/${post.body.item.id}/review`, { status: 'approved' })).status, 200);
  const feed = (await bob('GET', '/showcase')).body.items;
  assert.equal(feed.length, 1);
  assert.equal(feed[0].ownerName, 'Alice');
  assert.equal((await bob('POST', `/showcase/${feed[0].id}/cheer`)).body.item.cheers, 1);
  assert.equal((await bob('DELETE', `/showcase/${feed[0].id}`)).status, 404, 'cannot delete others');
  assert.equal((await alice('DELETE', `/showcase/${feed[0].id}`)).status, 200);

  const nolink = new FormData(); nolink.set('title', 'No video');
  assert.equal((await alice('POST', '/showcase', nolink, true)).status, 400);
});

test('staff lessons include researched topics', async () => {
  const api = client();
  await api('POST', '/auth/session', { idToken: token({ uid: 'lsn', email: 'l@x.com' }), profile: { name: 'Lee', role: 'professional', adultConfirmed: true } });
  const slugs = (await api('GET', '/lessons')).body.lessons.map((l) => l.slug);
  for (const s of ['honest-reviews', 'disclose-like-a-pro', 'track-what-works', 'one-page-marketing-plan']) assert.ok(slugs.includes(s), s);
  assert.ok(slugs.length >= 12);
});

test('85% pass mark', async () => {
  const { finalize, RUBRICS } = await import('../src/ai/evaluator.js');
  const mk = (n) => ({ criteria: Object.fromEntries(['clarity', 'audience', 'value', 'visual'].map((k) => [k, { score: n }])) });
  assert.equal(finalize(mk(21), 'ai').percent, 84);
  assert.equal(finalize(mk(21), 'ai').passed, false, '84% must retry');
  assert.equal(finalize(mk(22), 'ai').passed, true);
  assert.equal(finalize(mk(99), 'ai', RUBRICS.ambassador).total, 80, 'scores clamp to max; missing criterion = 0');
});

test('cross-site POST is blocked', async () => {
  const res = await fetch(`${base}/auth/session`, { method: 'POST', headers: { origin: 'https://evil.example', 'content-type': 'application/json' }, body: '{}' });
  assert.equal(res.status, 403);
});

test('originality guardrail flags copied runs', () => {
  const src = 'Small businesses should ask their happiest customers for referrals right after a great experience because that is when they are most willing to help';
  const copied = checkOriginality(`Here is a tip. ${src}.`, [src]);
  assert.equal(copied.passed, false);
  const original = checkOriginality('Right after someone smiles about your product, invite them to tell a friend; delight makes people generous.', [src]);
  assert.equal(original.passed, true);
});

test('embed url conversion', () => {
  assert.equal(toEmbedUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ'), 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ');
  assert.equal(toEmbedUrl('https://vimeo.com/12345'), 'https://player.vimeo.com/video/12345');
  assert.equal(toEmbedUrl('javascript:alert(1)'), null);
});
