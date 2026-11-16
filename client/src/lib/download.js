/* global __PREVIEW__ */
// Save a file to the user's device. In the claude.ai preview the page cannot start
// downloads itself, so it asks the viewer through the artifact `downloads` capability.
import { useUI } from '../store/ui.js';

let capability;
const previewDownloads = () => (capability ??= window.claude?.use ? window.claude.use('downloads').catch(() => null) : Promise.resolve(null));

export async function downloadBlob(blob, filename) {
  if (__PREVIEW__) {
    const d = await previewDownloads();
    if (!d) {
      useUI.getState().toast('Downloads aren\'t available in this view.', 'error');
      return false;
    }
    try {
      await d.save({ filename, data: blob });
      useUI.getState().toast(`Saved ${filename}`, 'success');
      return true;
    } catch (e) {
      if (e?.code !== 'declined') useUI.getState().toast(e?.code === 'rate_limited' ? 'A save is already waiting for you. Try again in a moment.' : 'That file could not be saved here.', 'error');
      return false;
    }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
  return true;
}

export function downloadText(text, filename) {
  return downloadBlob(new Blob([text], { type: 'text/plain;charset=utf-8' }), filename);
}

export const safeName = (s, fallback = 'marketcraft') =>
  (String(s || fallback).replace(/[^\w\- ]+/g, '').trim().replace(/\s+/g, '-').slice(0, 60) || fallback);

const label = (k) => k.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase());

/** Turn any AI tool output into readable plain text. */
export function outputToText(v, depth = 0) {
  if (v == null) return '';
  if (typeof v !== 'object') return String(v);
  const pad = '  '.repeat(depth);
  if (Array.isArray(v)) {
    return v
      .map((x, i) => (typeof x === 'object' ? `${pad}#${i + 1}\n${outputToText(x, depth + 1)}` : `${pad}• ${x}`))
      .join('\n');
  }
  return Object.entries(v)
    .map(([k, x]) => (typeof x === 'object' ? `${pad}${label(k)}:\n${outputToText(x, depth + 1)}` : `${pad}${label(k)}: ${x}`))
    .join('\n');
}
