// Showcase: learners post their own marketing videos (upload or link).
// Private by default; "community" posts are reviewed by an admin before others see them.
import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { db } from '../db.js';
import { requireAuth, requireAdmin, ROLE_LABELS } from '../auth.js';
import { videoUpload, uploadPath, removeUpload, toEmbedUrl } from '../uploads.js';
import { reward } from '../progress.js';

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
  res.status(201).json({ item: serialize(item, req.user), newBadges });
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
  cheers.has(req.user.id) ? cheers.delete(req.user.id) : cheers.add(req.user.id);
  res.json({ item: serialize(await db.update('showcase', item.id, { cheers: [...cheers] }), req.user) });
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
