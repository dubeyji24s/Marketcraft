import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db.js';
import { requireAuth, requireAdmin } from '../auth.js';
import { videoUpload, uploadPath, removeUpload, toEmbedUrl } from '../uploads.js';
import { summarizeTranscript } from '../ai/interviews.js';

const router = Router();
router.use(requireAuth);
const upload = videoUpload('interviews');

const withMedia = (i) => ({ ...i, videoSrc: i.videoFile ? `/api/interviews/${i.id}/video` : null });

router.get('/', (req, res) => {
  const list = db.all('interviews', (i) => i.published || req.user.role === 'admin');
  res.json({ interviews: list.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map(withMedia) });
});

router.get('/:id/video', (req, res) => {
  const i = db.get('interviews', req.params.id);
  if (!i?.videoFile || (!i.published && req.user.role !== 'admin')) return res.status(404).end();
  res.sendFile(uploadPath('interviews', i.videoFile)); // supports HTTP range requests for seeking
});

const listField = z
  .union([z.array(z.string()), z.string()])
  .transform((v) => (Array.isArray(v) ? v : v.split('\n')).map((s) => s.trim()).filter(Boolean))
  .optional();

const InterviewSchema = z.object({
  title: z.string().trim().min(3).max(140),
  businessName: z.string().trim().max(100).optional().default(''),
  ownerName: z.string().trim().max(100).optional().default(''),
  videoUrl: z.string().trim().url().optional().or(z.literal('')),
  summary: z.string().trim().max(2000).optional().default(''),
  transcriptSummary: z.string().trim().max(4000).optional().default(''),
  transcript: z.string().max(100_000).optional().default(''),
  takeaways: listField,
  tags: listField,
  published: z
    .union([z.boolean(), z.enum(['true', 'false'])])
    .transform((v) => v === true || v === 'true')
    .optional(),
});

router.post('/', requireAdmin, upload.single('video'), async (req, res) => {
  const parsed = InterviewSchema.safeParse(req.body);
  if (!parsed.success) {
    removeUpload('interviews', req.file?.filename);
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }
  const d = parsed.data;
  const embedUrl = d.videoUrl ? toEmbedUrl(d.videoUrl) : null;
  if (!req.file && !embedUrl) {
    return res.status(400).json({ error: 'Upload a video file or paste a YouTube/Vimeo/Loom link.' });
  }
  const interview = await db.insert('interviews', {
    ...d,
    takeaways: d.takeaways ?? [],
    tags: d.tags ?? [],
    published: d.published ?? true,
    videoFile: req.file?.filename ?? null,
    embedUrl,
  });
  res.status(201).json({ interview: withMedia(interview) });
});

router.patch('/:id', requireAdmin, async (req, res) => {
  const parsed = InterviewSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
  const i = db.get('interviews', req.params.id);
  if (!i) return res.status(404).json({ error: 'Interview not found.' });
  const patch = Object.fromEntries(Object.entries(parsed.data).filter(([, v]) => v !== undefined));
  if (patch.videoUrl !== undefined) patch.embedUrl = patch.videoUrl ? toEmbedUrl(patch.videoUrl) : null;
  res.json({ interview: withMedia(await db.update('interviews', i.id, patch)) });
});

router.delete('/:id', requireAdmin, async (req, res) => {
  const i = db.get('interviews', req.params.id);
  if (!i) return res.status(404).json({ error: 'Interview not found.' });
  removeUpload('interviews', i.videoFile);
  await db.remove('interviews', i.id);
  res.json({ ok: true });
});

const SummarizeSchema = z.object({
  title: z.string().trim().min(3).max(140),
  businessName: z.string().trim().max(100).optional(),
  transcript: z.string().trim().min(200, 'Transcript is too short to summarize.').max(100_000),
});

router.post('/summarize', requireAdmin, async (req, res, next) => {
  const parsed = SummarizeSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
  try {
    res.json(await summarizeTranscript(parsed.data));
  } catch (err) {
    next(err);
  }
});

export default router;
