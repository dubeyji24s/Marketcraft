import fs from 'node:fs';
import path from 'node:path';
import multer from 'multer';
import { nanoid } from 'nanoid';
import { config } from './config.js';

const VIDEO_TYPES = new Set(['video/mp4', 'video/webm', 'video/quicktime', 'video/x-m4v', 'video/ogg']);
const EXT = { 'video/mp4': '.mp4', 'video/webm': '.webm', 'video/quicktime': '.mov', 'video/x-m4v': '.m4v', 'video/ogg': '.ogv' };

export function videoUpload(subdir) {
  const dir = path.join(config.uploadDir, subdir);
  fs.mkdirSync(dir, { recursive: true });
  return multer({
    storage: multer.diskStorage({
      destination: dir,
      // never trust the client filename
      filename: (_req, file, cb) => cb(null, `${nanoid(16)}${EXT[file.mimetype] ?? '.bin'}`),
    }),
    limits: { fileSize: config.maxVideoBytes, files: 1, fieldSize: 12 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      if (VIDEO_TYPES.has(file.mimetype)) cb(null, true);
      else cb(Object.assign(new Error('Only MP4, WebM, MOV or OGG videos are allowed.'), { status: 400 }));
    },
  });
}

export function uploadPath(subdir, filename) {
  // basename() blocks path traversal
  return path.join(config.uploadDir, subdir, path.basename(filename));
}

export function removeUpload(subdir, filename) {
  if (!filename) return;
  fs.promises.unlink(uploadPath(subdir, filename)).catch(() => {});
}

/** Turn a YouTube / Vimeo / Loom share link into an embeddable URL; null if unsupported. */
export function toEmbedUrl(raw) {
  let u;
  try {
    u = new URL(raw);
  } catch {
    return null;
  }
  if (u.protocol !== 'https:') return null;
  const host = u.hostname.replace(/^www\.|^m\./, '');
  if (host === 'youtube.com') {
    const id = u.searchParams.get('v') || u.pathname.match(/^\/(?:shorts|embed|live)\/([\w-]{6,})/)?.[1];
    return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
  }
  if (host === 'youtu.be') return `https://www.youtube-nocookie.com/embed/${u.pathname.slice(1)}`;
  if (host === 'vimeo.com') {
    const id = u.pathname.match(/^\/(\d+)/)?.[1];
    return id ? `https://player.vimeo.com/video/${id}` : null;
  }
  if (host === 'loom.com') {
    const id = u.pathname.match(/^\/share\/([\w]+)/)?.[1];
    return id ? `https://www.loom.com/embed/${id}` : null;
  }
  return null;
}
