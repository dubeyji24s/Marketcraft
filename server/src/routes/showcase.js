// Showcase: learners post their own marketing videos (upload or link).
// Private by default; "community" posts are reviewed by an admin before others see them.
import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { db } from '../db.js';
import { requireAuth, requireAdmin, ROLE_LABELS } from '../auth.js';
import { videoUpload, uploadPath, removeUpload, toEmbedUrl } from '../uploads.js';
import { reward, activity } from '../progress.js';
import { MEDAL_VIEWS } from '../play/rules.js';

const router = Router();
router.use(requireAuth);
const upload = videoUpload('showcase');

const isVisible = (item, user) =>
  item.userId === user.id || user.role === 'admin' || (item.visibility === 'community' && item.status === 'approved');

function serialize(item, user) {
  const owner = db.get('users', item.userId);
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    channel: item.channel,
    tags: item.tags,
    visibility: item.visibility,
    status: item.status,
    reviewNote: item.userId === user.id || user.role === 'admin' ? item.reviewNote ?? null : undefined,
    createdAt: item.createdAt,
    ownerName: owner?.name ?? 'Former learner',
    ownerRole: ROLE_LABELS[owner?.role] ?? '',
    mine: item.userId === user.id,
    videoSrc: item.videoFile ? `/api/showcase/${item.id}/video` : null,
    embedUrl: item.videoUrl ? toEmbedUrl(item.videoUrl) : null,
    videoUrl: item.videoUrl,
    cheers: item.cheers?.length ?? 0,
    views: item.viewers?.length ?? 0,
    cheeredByMe: Boolean(item.cheers?.includes(user.id)),
  };
}

router.get('/', (req, res) => {
  const scope = req.query.scope === 'mine' ? 'mine' : 'community';
  const items = db
    .all('showcase', (i) => (scope === 'mine' ? i.userId === req.user.id : i.visibility === 'community' && i.status === 'approved'))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((i) => serialize(i, req.user));
  res.json({ items });
});

router.get('/:id/video', (req, res) => {
  const item = db.get('showcase', req.params.id);
  if (!item?.videoFile || !isVisible(item, req.user)) return res.status(404).end();
  res.sendFile(uploadPath('showcase', item.videoFile));
});

const postLimiter = rateLimit({ windowMs: 60 * 60 * 1000, limit: 20, keyGenerator: (req) => req.user.id, message: { error: 'You have posted a lot this hour. Try again later.' } });

const PostSchema = z.object({
  title: z.string().trim().min(3, 'Give your video a title (3+ characters).').max(100),
  description: z.string().trim().max(1500).optional().default(''),
  channel: z.enum(['social', 'digital-ad', 'outdoor']).default('social'),
  tags: z
    .string()
    .optional()
    .transform((s) => (s ?? '').split(/[,\n]/).map((t) => t.trim().replace(/^#/, '').toLowerCase()).filter(Boolean).slice(0, 6)),
  visibility: z.enum(['private', 'community']).default('private'),
  videoUrl: z.string().trim().url().refine((u) => u.startsWith('https://'), 'Video links must start with https://').optional().or(z.literal('')),
});

router.post('/', postLimiter, upload.single('video'), async (req, res) => {
  const parsed = PostSchema.safeParse(req.body);
  if (!parsed.success) {
    removeUpload('showcase', req.file?.filename);
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }
  const d = parsed.data;
  if (!req.file && !d.videoUrl) return res.status(400).json({ error: 'Upload your video or paste a link to it.' });
  const admin = req.user.role === 'admin';
  const item = await db.insert('showcase', {
    userId: req.user.id,
    title: d.title,
    description: d.description,
    channel: d.channel,
    tags: d.tags,
    visibility: d.visibility,
    status: d.visibility === 'community' && !admin ? 'pending' : 'approved',
    videoFile: req.file?.filename ?? null,
    videoUrl: d.videoUrl || null,
    cheers: [],
  });
  const newBadges = await reward(req.user, { xp: 20, badges: ['showcase'] });
  const play = await activity(req.user, 'showcase');
  res.status(201).json({ item: serialize(item, req.user), newBadges: [...newBadges, ...play.newBadges], play });
});

router.patch('/:id', async (req, res) => {
  const item = db.get('showcase', req.params.id);
  if (!item || item.userId !== req.user.id) return res.status(404).json({ error: 'Video not found.' });
  const parsed = z.object({ visibility: z.enum(['private', 'community']) }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid visibility.' });
  const v = parsed.data.visibility;
  // Going public needs a (new) admin review unless it was already approved for the community.
  const alreadyPublic = item.visibility === 'community' && item.status === 'approved';
  const status = v === 'private' || req.user.role === 'admin' || alreadyPublic ? 'approved' : 'pending';
  res.json({ item: serialize(await db.update('showcase', item.id, { visibility: v, status }), req.user) });
});

router.delete('/:id', async (req, res) => {
  const item = db.get('showcase', req.params.id);
  if (!item || (item.userId !== req.user.id && req.user.role !== 'admin')) return res.status(404).json({ error: 'Video not found.' });
  removeUpload('showcase', item.videoFile);
  await db.remove('showcase', item.id);
  res.json({ ok: true });
});

router.post('/:id/cheer', async (req, res) => {
  const item = db.get('showcase', req.params.id);
  if (!item || !isVisible(item, req.user)) return res.status(404).json({ error: 'Video not found.' });
  const cheers = new Set(item.cheers ?? []);
  const adding = !cheers.has(req.user.id);
  adding ? cheers.add(req.user.id) : cheers.delete(req.user.id);
  const play = adding && item.userId !== req.user.id ? await activity(req.user, 'showcase') : null;
  res.json({ item: serialize(await db.update('showcase', item.id, { cheers: [...cheers] }), req.user), play });
});

// ---- views (unique signed-in viewers, never the owner) ------------------------------------
router.post('/:id/view', async (req, res) => {
  const item = db.get('showcase', req.params.id);
  if (!item || !isVisible(item, req.user)) return res.status(404).json({ error: 'Video not found.' });
  const viewers = item.viewers ?? [];
  const counts = item.visibility === 'community' && item.status === 'approved' && item.userId !== req.user.id && !viewers.includes(req.user.id);
  if (counts) await db.update('showcase', item.id, { viewers: [...viewers, req.user.id] });
  res.json({ views: (item.viewers ?? viewers).length });
});

// ---- junior medal ------------------------------------------------------------------------
// Juniors (kid accounts, run by a parent) whose marketing video reaches 1,000 views can ask
// for a free medal posted home. The parent enters the address; an admin checks the claim and
// posts the medal; the address is deleted as soon as the medal ships or the claim is declined.
const ACTIVE = ['requested', 'approved', 'shipped'];
const myClaim = (userId) => db.all('medals', (m) => m.userId === userId).sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0] ?? null;
const claimOut = (m, admin = false) =>
  m && {
    id: m.id,
    status: m.status,
    source: m.source,
    showcaseId: m.showcaseId,
    showcaseTitle: db.get('showcase', m.showcaseId)?.title ?? null,
    views: m.views,
    externalUrl: m.externalUrl,
    note: m.note ?? null,
    createdAt: m.createdAt,
    shippedAt: m.shippedAt ?? null,
    // the full address is only ever shown to admins, and only until the medal ships
    shipTo: admin ? m.shipping ?? null : m.shipping ? { city: m.shipping.city, country: m.shipping.country } : null,
    ...(admin ? { learner: db.get('users', m.userId)?.name ?? 'Former learner', parentName: db.get('users', m.userId)?.parentName ?? null, contactEmail: db.get('users', m.userId)?.email ?? null } : {}),
  };

router.get('/medal/status', (req, res) => {
  const junior = req.user.role === 'kid';
  const videos = db
    .all('showcase', (i) => i.userId === req.user.id && i.visibility === 'community' && i.status === 'approved')
    .map((i) => ({ id: i.id, title: i.title, views: i.viewers?.length ?? 0 }))
    .sort((a, b) => b.views - a.views);
  res.json({ junior, threshold: MEDAL_VIEWS, videos, claim: claimOut(myClaim(req.user.id)) });
});

const medalLimiter = rateLimit({ windowMs: 24 * 60 * 60 * 1000, limit: 5, keyGenerator: (req) => req.user.id, message: { error: 'Too many medal requests today. Try again tomorrow.' } });
const line = (min, max, msg) => z.string().trim().min(min, msg).max(max);
const ClaimSchema = z.object({
  showcaseId: z.string().min(1, 'Choose the video that reached 1,000 views.'),
  source: z.enum(['marketcraft', 'external']),
  externalUrl: z.string().trim().url().refine((u) => u.startsWith('https://'), 'The link must start with https://').optional().or(z.literal('')),
  externalViews: z.coerce.number().int().min(0).max(1_000_000_000).optional(),
  parentConfirm: z.literal(true, { error: 'A parent or guardian must confirm the address.' }),
  shipping: z.object({
    recipientName: line(2, 80, 'Enter the parent or guardian\'s name.'),
    line1: line(3, 120, 'Enter the street address.'),
    line2: z.string().trim().max(120).optional().default(''),
    city: line(2, 60, 'Enter the city or town.'),
    region: z.string().trim().max(60).optional().default(''),
    postalCode: line(2, 20, 'Enter the postal or ZIP code.'),
    country: line(2, 60, 'Enter the country.'),
  }),
});

router.post('/medal/claim', medalLimiter, async (req, res) => {
  if (req.user.role !== 'kid') return res.status(403).json({ error: 'The medal is for junior (kid) accounts.' });
  const current = myClaim(req.user.id);
  if (current && ACTIVE.includes(current.status)) return res.status(409).json({ error: 'You already have a medal request. Check its status below.' });
  const parsed = ClaimSchema.safeParse(req.body ?? {});
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
  const d = parsed.data;
  const item = db.get('showcase', d.showcaseId);
  if (!item || item.userId !== req.user.id) return res.status(404).json({ error: 'Choose one of your own Showcase videos.' });
  const views = item.viewers?.length ?? 0;
  if (d.source === 'marketcraft') {
    if (item.visibility !== 'community' || item.status !== 'approved') return res.status(400).json({ error: 'The video must be approved for the community first.' });
    if (views < MEDAL_VIEWS) return res.status(400).json({ error: `This video has ${views} of ${MEDAL_VIEWS} views so far. Keep sharing!` });
  } else {
    if (!d.externalUrl) return res.status(400).json({ error: 'Paste the link to the video where it got 1,000 views.' });
    if ((d.externalViews ?? 0) < MEDAL_VIEWS) return res.status(400).json({ error: `The video needs at least ${MEDAL_VIEWS} views.` });
  }
  const claim = await db.insert('medals', {
    userId: req.user.id,
    showcaseId: item.id,
    source: d.source,
    views: d.source === 'marketcraft' ? views : d.externalViews,
    externalUrl: d.source === 'external' ? d.externalUrl : null,
    shipping: d.shipping,
    status: 'requested',
  });
  res.status(201).json({ claim: claimOut(claim) });
});

router.get('/medal/claims', requireAdmin, (req, res) => {
  const claims = db.all('medals').sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map((m) => claimOut(m, true));
  res.json({ claims, threshold: MEDAL_VIEWS });
});

router.post('/medal/claims/:id', requireAdmin, async (req, res) => {
  const parsed = z.object({ status: z.enum(['approved', 'shipped', 'declined']), note: z.string().trim().max(300).optional() }).safeParse(req.body ?? {});
  if (!parsed.success) return res.status(400).json({ error: 'Choose approve, shipped or decline.' });
  const m = db.get('medals', req.params.id);
  if (!m) return res.status(404).json({ error: 'Claim not found.' });
  const { status, note } = parsed.data;
  const patch = { status, note: note || m.note || null };
  if (status === 'shipped') patch.shippedAt = new Date().toISOString();
  // privacy: the home address is deleted once it is no longer needed
  if (status === 'shipped' || status === 'declined') patch.shipping = null;
  const saved = await db.update('medals', m.id, patch);
  if (status === 'approved' || status === 'shipped') {
    const owner = db.get('users', m.userId);
    if (owner) await reward(owner, { xp: 100, badges: ['medal'] });
  }
  res.json({ claim: claimOut(saved, true) });
});

// ---- admin moderation ---------------------------------------------------------
router.get('/review/queue', requireAdmin, (req, res) => {
  const items = db.all('showcase', (i) => i.visibility === 'community' && i.status === 'pending').map((i) => serialize(i, req.user));
  res.json({ items });
});

router.post('/:id/review', requireAdmin, async (req, res) => {
  const parsed = z.object({ status: z.enum(['approved', 'rejected']), note: z.string().trim().max(300).optional() }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Choose approve or reject.' });
  const item = db.get('showcase', req.params.id);
  if (!item) return res.status(404).json({ error: 'Video not found.' });
  res.json({ item: serialize(await db.update('showcase', item.id, { status: parsed.data.status, reviewNote: parsed.data.note || null, reviewedAt: new Date().toISOString() }), req.user) });
});

export default router;
