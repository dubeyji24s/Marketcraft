// Canva connection flow against a simulated Canva API (real Canva is not reachable in CI).
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'mc-canva-'));
process.env.DATA_FILE = path.join(tmp, 'db.json');
process.env.UPLOAD_DIR = path.join(tmp, 'uploads');
process.env.FIREBASE_PROJECT_ID = 'demo-marketcraft';
process.env.CANVA_CLIENT_ID = 'test-client';
process.env.CANVA_CLIENT_SECRET = 'test-secret';
process.env.CANVA_REDIRECT_URI = 'http://127.0.0.1/api/canva/callback';

const { createApp } = await import('../src/app.js');
const { setTokenVerifier } = await import('../src/firebase.js');
const { db } = await import('../src/db.js');
setTokenVerifier(async (t) => ({ auth_time: Math.floor(Date.now() / 1000), email_verified: true, ...JSON.parse(t) }));

// ---- simulated Canva --------------------------------------------------------------------
const realFetch = globalThis.fetch;
const canvaCalls = [];
let tokenCounter = 0;
globalThis.fetch = async (url, init = {}) => {
  const u = new URL(url);
  if (u.hostname !== 'api.canva.com') return realFetch(url, init);
  canvaCalls.push({ path: u.pathname, method: init.method ?? 'GET', headers: init.headers ?? {}, body: init.body });
  const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
  if (u.pathname === '/rest/v1/oauth/token') {
    const p = new URLSearchParams(init.body);
    if (init.headers.Authorization !== `Basic ${Buffer.from('test-client:test-secret').toString('base64')}`) return json(401, {});
    if (p.get('grant_type') === 'authorization_code' && (p.get('code') !== 'good-code' || !p.get('code_verifier'))) return json(400, {});
    tokenCounter++;
    return json(200, { access_token: `acc-${tokenCounter}`, refresh_token: `ref-${tokenCounter}`, expires_in: p.get('grant_type') === 'authorization_code' ? 1 : 3600 });
  }
  if (u.pathname === '/rest/v1/users/me/profile') return json(200, { profile: { display_name: 'Ada on Canva' } });
  if (u.pathname === '/rest/v1/asset-uploads' && init.method === 'POST') return json(200, { job: { id: 'job1', status: 'in_progress' } });
  if (u.pathname === '/rest/v1/asset-uploads/job1') return json(200, { job: { id: 'job1', status: 'success', asset: { id: 'asset1' } } });
  if (u.pathname === '/rest/v1/designs' && init.method === 'POST') return json(200, { design: { id: 'des1', urls: { edit_url: 'https://www.canva.com/design/des1/edit' } } });
  if (u.pathname === '/rest/v1/oauth/revoke') return json(200, {});
  return json(404, {});
};

let server, base;
before(() => {
  server = createApp().listen(0);
  base = `http://127.0.0.1:${server.address().port}/api`;
});
after(() => { server.close(); globalThis.fetch = realFetch; });

function client() {
  let cookie = '';
  return async (method, url, body) => {
    const res = await realFetch(base + url, { method, redirect: 'manual', headers: { cookie, ...(body ? { 'content-type': 'application/json' } : {}) }, body: body ? JSON.stringify(body) : undefined });
    const set = res.headers.get('set-cookie');
    if (set) cookie = set.split(';')[0];
    return { status: res.status, location: res.headers.get('location'), body: await res.json().catch(() => null) };
  };
}

test('connect your own Canva, send a design, disconnect', async () => {
  const api = client();
  await api('POST', '/auth/session', { idToken: JSON.stringify({ uid: 'cv1', email: 'cv@x.com', pad: 'x'.repeat(20) }), profile: { name: 'Ada', role: 'adult', adultConfirmed: true } });
  assert.deepEqual((await api('GET', '/canva/status')).body, { configured: true, connected: false, connectedAt: null, displayName: null });
  assert.equal((await api('POST', '/canva/send-design', { name: 'x', png: 'data:image/png;base64,AAAA', width: 100, height: 100 })).status, 409, 'must connect first');

  // 1) connect: redirect to Canva with PKCE + state
  const c = await api('GET', '/canva/connect');
  assert.equal(c.status, 302);
  const auth = new URL(c.location);
  assert.equal(auth.origin + auth.pathname, 'https://www.canva.com/api/oauth/authorize');
  assert.equal(auth.searchParams.get('client_id'), 'test-client');
  assert.equal(auth.searchParams.get('code_challenge_method'), 's256');
  assert.ok(auth.searchParams.get('code_challenge').length >= 43);
  assert.match(auth.searchParams.get('scope'), /asset:write/);
  const state = auth.searchParams.get('state');

  // forged state is rejected
  assert.match((await api('GET', `/canva/callback?code=good-code&state=wrong`)).location, /canva=failed/);
  // state is single-use, so start again
  const state2 = new URL((await api('GET', '/canva/connect')).location).searchParams.get('state');
  assert.notEqual(state, state2);
  const cb = await api('GET', `/canva/callback?code=good-code&state=${state2}`);
  assert.match(cb.location, /\/app\/lab\?canva=connected/);
  const st = (await api('GET', '/canva/status')).body;
  assert.equal(st.connected, true);
  assert.equal(st.displayName, 'Ada on Canva');

  // tokens are encrypted at rest
  const stored = db.find('users', (u) => u.firebaseUid === 'cv1').canva.tokens;
  assert.ok(!stored.includes('acc-') && !stored.includes('ref-'));

  // 2) send a design (the first token expires immediately → refresh is used)
  const png = 'data:image/png;base64,' + Buffer.from('fake-png-bytes').toString('base64');
  const sent = await api('POST', '/canva/send-design', { name: 'My flyer', png, width: 1275, height: 1650 });
  assert.equal(sent.status, 200, JSON.stringify(sent.body));
  assert.equal(sent.body.editUrl, 'https://www.canva.com/design/des1/edit');
  assert.ok(canvaCalls.some((x) => x.path.endsWith('/oauth/token') && new URLSearchParams(x.body).get('grant_type') === 'refresh_token'), 'refreshed expired token');
  const up = canvaCalls.find((x) => x.path === '/rest/v1/asset-uploads');
  assert.equal(up.headers['Content-Type'], 'application/octet-stream');
  assert.equal(JSON.parse(up.headers['Asset-Upload-Metadata']).name_base64, Buffer.from('My flyer').toString('base64'));
  const design = JSON.parse(canvaCalls.find((x) => x.path === '/rest/v1/designs').body);
  assert.deepEqual(design, { design_type: { type: 'custom', width: 1275, height: 1650 }, asset_id: 'asset1', title: 'My flyer' });

  // 3) disconnect
  assert.equal((await api('POST', '/canva/disconnect')).status, 200);
  assert.equal((await api('GET', '/canva/status')).body.connected, false);
  assert.ok(canvaCalls.some((x) => x.path.endsWith('/oauth/revoke')));
});
