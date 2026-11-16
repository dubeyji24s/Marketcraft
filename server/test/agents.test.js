// Partner Guard, Director and Partner-mode Lab.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'mc-agents-'));
process.env.DATA_FILE = path.join(tmp, 'db.json');
process.env.UPLOAD_DIR = path.join(tmp, 'uploads');
process.env.FIREBASE_PROJECT_ID = 'demo-marketcraft';
delete process.env.ANTHROPIC_API_KEY;

const { createApp } = await import('../src/app.js');
const { seed } = await import('../src/seed.js');
const { setTokenVerifier } = await import('../src/firebase.js');
const { db } = await import('../src/db.js');
const { saveBrief } = await import('../src/company.js');
const { checkRelevance, checkRequest, partnerVocabulary } = await import('../src/agents/guard.js');
setTokenVerifier(async (t) => ({ auth_time: Math.floor(Date.now() / 1000), email_verified: true, ...JSON.parse(t) }));

const BRIEF = {
  displayName: 'Partner Website', name: 'NexaEdits', website: 'https://www.nexaedits.example',
  tagline: 'Find the perfect product in seconds', description: 'A shopping assistant that curates the top 6 products for any need, like gifts, boots or winter coats.',
  products: 'Curated shopping lists\nGift finder', audience: 'Busy shoppers and gift givers', keyMessages: 'Saves time\nHonest picks', offers: '', voice: '', dos: '', donts: '', hashtags: '#NexaEdits',
};

let server, base;
before(async () => {
  await seed();
  await saveBrief(BRIEF);
  server = createApp().listen(0);
  base = `http://127.0.0.1:${server.address().port}/api`;
});
after(() => server.close());

function client() {
  let cookie = '';
  return async (method, url, body) => {
    const res = await fetch(base + url, { method, headers: { cookie, ...(body ? { 'content-type': 'application/json' } : {}) }, body: body ? JSON.stringify(body) : undefined });
    const set = res.headers.get('set-cookie');
    if (set) cookie = set.split(';')[0];
    return { status: res.status, body: await res.json().catch(() => null) };
  };
}
const tok = (claims) => JSON.stringify({ pad: 'x'.repeat(20), ...claims });

test('guard rules: strong, related, ambiguous, off-topic, own business', () => {
  const v = partnerVocabulary(BRIEF);
  assert.ok(v.strong.includes('nexaedits') && v.strong.includes('nexaedits.example') && v.strong.includes('#nexaedits'));
  assert.equal(checkRelevance('Try NexaEdits today!', BRIEF).level, 'strong');
  assert.equal(checkRelevance('Visit nexaedits.example for gift ideas', BRIEF).level, 'strong');
  assert.equal(checkRelevance('Our curated shopping picks for winter gifts', BRIEF).level, 'related');
  assert.equal(checkRelevance('Big sale on boots this weekend', BRIEF).level, 'ambiguous');
  const off = checkRelevance('Fresh lemonade, $1 a cup!', BRIEF);
  assert.equal(off.ok, false);
  assert.match(off.message, /Partner Website/);
  assert.equal(checkRequest('a flyer for my lemonade stand', BRIEF).ok, false);
  assert.equal(checkRequest('a flyer for my channel about NexaEdits', BRIEF).ok, true, 'naming the partner is fine');
});

test('Lab: closed → Partner mode on joining → Own mode after the Ambassador certificate', async () => {
  const api = client();
  await api('POST', '/auth/session', { idToken: tok({ uid: 'pm1', email: 'pm@x.com' }), profile: { name: 'Pat', role: 'adult', adultConfirmed: true } });
  assert.equal((await api('GET', '/lab/status')).body.unlocked, false);

  // joining the Ambassador Program opens Partner mode
  const user = db.find('users', (u) => u.firebaseUid === 'pm1');
  await db.update('users', user.id, { ambassador: { code: 'PATCODE1', joinedAt: new Date().toISOString() } });
  const st = (await api('GET', '/lab/status')).body;
  assert.equal(st.unlocked, true);
  assert.equal(st.mode, 'partner');
  assert.equal(st.partner.name, 'NexaEdits');
  assert.match(st.partner.referralLink, /ref=PATCODE1/);

  // own brand is locked in Partner mode
  assert.equal((await api('PUT', '/lab/brand', { name: 'x' })).status, 403);

  // off-topic requests are stopped before any work (0 tokens)
  const off = await api('POST', '/lab/tools/social-post', { inputs: { platform: 'Instagram', topic: 'my lemonade stand summer sale', goal: 'Build awareness' } });
  assert.equal(off.status, 422);
  assert.match(off.body.error, /Partner Website/);

  // on-topic request: written about the partner, with disclosure + referral link
  const inputs = { platform: 'Instagram', topic: 'finding a gift in seconds', goal: 'Get people to visit the website' };
  const ok = await api('POST', '/lab/tools/social-post', { inputs });
  assert.equal(ok.status, 201, JSON.stringify(ok.body));
  const text = JSON.stringify(ok.body.run.output);
  assert.ok(text.includes('NexaEdits') && text.includes('#ad') && text.includes('ref=PATCODE1'));
  assert.equal(ok.body.run.cached, false);
  // identical request → answered from the Director's cache
  const again = await api('POST', '/lab/tools/social-post', { inputs });
  assert.equal(again.body.run.cached, true);
  assert.equal(again.body.run.tokens, 0);

  // designs must mention the partner
  const doc = (t) => ({ width: 1080, height: 1080, preset: 'instagram-post', background: { type: 'solid', color: '#000' }, elements: [{ id: 'a', type: 'text', text: t }] });
  const badDesign = await api('POST', '/lab/designs', { name: 'Lemonade', doc: doc('Lemonade $1') });
  assert.equal(badDesign.status, 422);
  assert.equal((await api('POST', '/lab/designs', { name: 'Gifts', doc: doc('Gift ideas in seconds with NexaEdits') })).status, 201);

  // guard service for the browser (video / downloads)
  assert.equal((await api('POST', '/lab/guard', { texts: ['Meet our dog-walking service'] })).body.ok, false);
  assert.equal((await api('POST', '/lab/guard', { texts: ['Curated gift picks', 'shop at nexaedits.example'] })).body.ok, true);

  // agent report shows the team at work
  const rep = (await api('GET', '/lab/agents')).body;
  const byId = Object.fromEntries(rep.agents.map((a) => [a.id, a]));
  assert.ok(byId.guard.runs >= 4 && byId.guard.blocked >= 2);
  assert.ok(byId.copywriter.cacheHits >= 1);
  assert.equal(rep.aiEnabled, false);

  // Ambassador certificate → Own mode
  const mission = db.find('challenges', (c) => c.kind === 'ambassador');
  await db.insert('certificates', { userId: user.id, challengeId: mission.id, kind: 'ambassador', score: 90, verifyCode: 'X' });
  const own = (await api('GET', '/lab/status')).body;
  assert.equal(own.mode, 'own');
  const emptyBrand = Object.fromEntries(['name', 'website', 'tagline', 'description', 'products', 'audience', 'keyMessages', 'offers', 'voice', 'dos', 'donts', 'hashtags'].map((k) => [k, '']));
  assert.equal((await api('PUT', '/lab/brand', { ...emptyBrand, name: 'Pat\'s Lemonade', description: 'Fresh lemonade' })).status, 200);
  assert.equal((await api('POST', '/lab/designs', { name: 'Lemonade', doc: doc('Lemonade $1') })).status, 201, 'no partner rule in Own mode');
  assert.equal((await api('POST', '/lab/guard', { texts: ['anything'] })).body.level, 'own-mode');
});
