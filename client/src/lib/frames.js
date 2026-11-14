// Extracts evenly spaced still frames from a local video file in the browser so the
// AI evaluator can judge visual appeal without uploading/transcoding on the server.
export async function extractFrames(file, { count = 6, maxWidth = 768, quality = 0.72 } = {}) {
  const url = URL.createObjectURL(file);
  const video = document.createElement('video');
  video.muted = true;
  video.playsInline = true;
  video.preload = 'auto';
  video.src = url;

  try {
    await once(video, 'loadedmetadata');
    const duration = Number.isFinite(video.duration) ? video.duration : 0;
    if (!duration) return [];
    const scale = Math.min(1, maxWidth / video.videoWidth);
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(video.videoWidth * scale);
    canvas.height = Math.round(video.videoHeight * scale);
    const ctx = canvas.getContext('2d');

    const frames = [];
    for (let i = 0; i < count; i++) {
      video.currentTime = Math.min(duration - 0.05, ((i + 0.5) / count) * duration);
      await once(video, 'seeked');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      frames.push(canvas.toDataURL('image/jpeg', quality));
    }
    return frames;
  } catch {
    return []; // unsupported codec etc. — the server still evaluates the text
  } finally {
    URL.revokeObjectURL(url);
  }
}

function once(el, event, timeout = 8000) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`${event} timeout`)), timeout);
    el.addEventListener(event, () => { clearTimeout(t); resolve(); }, { once: true });
    el.addEventListener('error', () => { clearTimeout(t); reject(new Error('video error')); }, { once: true });
  });
}
