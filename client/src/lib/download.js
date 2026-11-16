// Save a file to the user's device.
export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export function downloadText(text, filename) {
  downloadBlob(new Blob([text], { type: 'text/plain;charset=utf-8' }), filename);
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
