// Connect your own Canva account (Free or Pro) through Canva's Connect API.
// OAuth 2.0 authorization code flow with PKCE; tokens are stored encrypted per user.
// "Send to Canva" uploads a design as an image asset and creates a Canva design with it,
// then returns Canva's edit link, so the learner keeps working in their own Canva
// (with all of their Pro features if they pay for Pro).
//
// Setup (once, by the site owner): create an integration at canva.com/developers,
// add the redirect URL, enable the scopes below, then set CANVA_CLIENT_ID,
// CANVA_CLIENT_SECRET and CANVA_REDIRECT_URI.
import { Router } from 'express';
import crypto from 'node:crypto';
import { z } from 'zod';
import { db } from '../db.js';
import { config } from '../config.js';
import { requireAuth } from '../auth.js';
import { labMode } from './lab.js';
import { guard } from '../agents/director.js';
import { getBrief } from '../company.js';

const router = Router();
const AUTHORIZE_URL = 'https://www.canva.com/api/oauth/authorize';
const API = 'https://api.canva.com/rest/v1';
export const CANVA_SCOPES = ['asset:write', 'design:content:write', 'design:meta:read', 'profile:read'];

// ---- token encryption (AES-256-GCM, key derived from the server secret) -----------------
const key = () => crypto.createHash('sha256').update(`${config.jwtSecret}:canva-tokens`).digest();
export function seal(obj) {
  const iv = crypto.randomBytes(12);
  const c = crypto.createCipheriv('aes-256-gcm', key(), iv);
  const data = Buffer.concat([c.update(JSON.stringify(obj), 'utf8'), c.final()]);
  return [iv, c.getAuthTag(), data].map((b) => b.toString('base64')).join('.');
}
export function unseal(str) {
  const [iv, tag, data] = str.split('.').map((s) => Buffer.from(s, 'base64'));
  const d = crypto.createDecipheriv('aes-256-gcm', key(), iv);
  d.setAuthTag(tag);
  return JSON.parse(Buffer.concat([d.update(data), d.final()]).toString('utf8'));
}

const b64url = (buf) => buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const basicAuth = () => `Basic ${Buffer.from(`${config.canva.clientId}:${config.canva.clientSecret}`).toString('base64')}`;

class CanvaError extends Error {
  constructor(message, status = 502) {
    super(message);
    this.status = status;
  }
}

async function tokenRequest(params) {
  const res = await fetch(`${API}/oauth/token`, {
    method: 'POST',
    headers: { Authorization: basicAuth(), 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(params),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || !body.access_token) throw new CanvaError('Canva did not accept the connection. Please try connecting again.', 502);
  return { accessToken: body.access_token, refreshToken: body.refresh_token, expiresAt: Date.now() + (body.expires_in ?? 3600) * 1000 };
}

/** Returns a valid access token for the user, refreshing it when needed. */
async function accessTokenFor(user) {
  if (!user.canva?.tokens) throw new CanvaError('Connect your Canva account first.', 409);
  let t = unseal(user.canva.tokens);
  if (Date.now() > t.expiresAt - 60_000) {
    try {
      t = await tokenRequest({ grant_type: 'refresh_token', refresh_token: t.refreshToken });
    } catch {
      await db.update('users', user.id, { canva: null });
      throw new CanvaError('Your Canva connection expired. Please connect again.', 409);
    }
    await db.update('users', user.id, { canva: { ...user.canva, tokens: seal(t) } });
  }
  return t.accessToken;
}

async function canvaFetch(token, path, init = {}) {
  const res = await fetch(`${API}${path}`, { ...init, headers: { Authorization: `Bearer ${token}`, ...(init.headers ?? {}) } });
  const body = await res.json().catch(() => ({}));
  if (res.status === 401) throw new CanvaError('Your Canva connection expired. Please connect again.', 409);
  if (!res.ok) throw new CanvaError(body?.message ? `Canva: ${body.message}` : `Canva returned an error (${res.status}).`, 502);
  return body;
}

// ---- routes ---------------------------------------------------------------------------
router.get('/status', requireAuth, (req, res) => {
  res.json({
    configured: config.canva.enabled,
    connected: Boolean(req.user.canva?.tokens),
    connectedAt: req.user.canva?.connectedAt ?? null,
    displayName: req.user.canva?.displayName ?? null,
  });
});

router.get('/connect', requireAuth, async (req, res) => {
  if (!config.canva.enabled) return res.status(503).json({ error: 'Canva connection is not set up on this server yet.' });
  const verifier = b64url(crypto.randomBytes(64));
  const challenge = b64url(crypto.createHash('sha256').update(verifier).digest());
  const state = b64url(crypto.randomBytes(24));
  await db.update('users', req.user.id, { canvaPending: { state, verifier, createdAt: Date.now() } });
  const url = new URL(AUTHORIZE_URL);
  url.search = new URLSearchParams({
    code_challenge: challenge,
    code_challenge_method: 's256',
    scope: CANVA_SCOPES.join(' '),
    response_type: 'code',
    client_id: config.canva.clientId,
    state,
    redirect_uri: config.canva.redirectUri,
  }).toString();
  res.redirect(url.toString());
});

router.get('/callback', requireAuth, async (req, res) => {
  const back = (status) => res.redirect(`/app/lab?canva=${status}`);
  const pending = req.user.canvaPending;
  await db.update('users', req.user.id, { canvaPending: null });
  if (req.query.error) return back('cancelled');
  if (!pending || req.query.state !== pending.state || Date.now() - pending.createdAt > 10 * 60_000 || typeof req.query.code !== 'string') return back('failed');
  try {
    const tokens = await tokenRequest({ grant_type: 'authorization_code', code_verifier: pending.verifier, code: req.query.code, redirect_uri: config.canva.redirectUri });
    let displayName = null;
    try {
      const me = await canvaFetch(tokens.accessToken, '/users/me/profile');
      displayName = me?.profile?.display_name ?? null;
    } catch { /* profile is optional */ }
    await db.update('users', req.user.id, { canva: { tokens: seal(tokens), connectedAt: new Date().toISOString(), displayName } });
    back('connected');
  } catch {
    back('failed');
  }
});

router.post('/disconnect', requireAuth, async (req, res) => {
  if (req.user.canva?.tokens && config.canva.enabled) {
    try {
      const t = unseal(req.user.canva.tokens);
      await fetch(`${API}/oauth/revoke`, { method: 'POST', headers: { Authorization: basicAuth(), 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ token: t.refreshToken ?? t.accessToken }) });
    } catch { /* best effort */ }
  }
  await db.update('users', req.user.id, { canva: null });
  res.json({ ok: true });
});

const SendSchema = z.object({
  name: z.string().trim().min(1).max(80),
  png: z.string().regex(/^data:image\/png;base64,/).max(12_000_000),
  width: z.number().int().min(40).max(8000),
  height: z.number().int().min(40).max(8000),
  texts: z.array(z.string().max(4000)).max(60).optional(),
});

router.post('/send-design', requireAuth, async (req, res, next) => {
  const parsed = SendSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'That design could not be sent.' });
  if (labMode(req.user) === 'partner') {
    const check = await guard({ kind: 'content', texts: [parsed.data.name, ...(parsed.data.texts ?? [])], brief: getBrief(), user: req.user });
    if (!check.ok) return res.status(422).json({ error: check.message, guard: check });
  }
  try {
    const token = await accessTokenFor(req.user);
    const { name, png, width, height } = parsed.data;
    const bytes = Buffer.from(png.split(',')[1], 'base64');

    // 1) upload the image as an asset (asynchronous job)
    const upload = await canvaFetch(token, '/asset-uploads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/octet-stream', 'Asset-Upload-Metadata': JSON.stringify({ name_base64: Buffer.from(name.slice(0, 50)).toString('base64') }) },
      body: bytes,
    });
    let job = upload.job;
    for (let i = 0; i < 20 && job?.status === 'in_progress'; i++) {
      await new Promise((r) => setTimeout(r, 750));
      job = (await canvaFetch(token, `/asset-uploads/${encodeURIComponent(job.id)}`)).job;
    }
    if (job?.status !== 'success' || !job.asset?.id) throw new CanvaError('Canva could not import the design image. Try again.');

    // 2) create a design of the same size containing that image
    const created = await canvaFetch(token, '/designs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ design_type: { type: 'custom', width, height }, asset_id: job.asset.id, title: name }),
    });
    const editUrl = created?.design?.urls?.edit_url;
    if (!editUrl) throw new CanvaError('Canva created the design but returned no link. Check your Canva home page.');
    res.json({ editUrl, designId: created.design.id });
  } catch (err) {
    if (err instanceof CanvaError) return res.status(err.status).json({ error: err.message });
    next(err);
  }
});

export default router;
