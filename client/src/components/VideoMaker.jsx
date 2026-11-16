// Video Maker: build a short marketing video from scenes (animated backgrounds, your own
// photos or clips, text) with free generated music, then export it as a video file.
// Backgrounds and music are generated in the browser, so they are original and free to use.
import { useEffect, useRef, useState } from 'react';
import { BEAT_STYLES, scheduleBeat, previewBeat } from '../lib/beats.js';
import { downloadBlob, safeName } from '../lib/download.js';

export const FORMATS = {
  vertical: { label: 'Vertical 9:16 (Reels, TikTok, Shorts)', w: 720, h: 1280 },
  square: { label: 'Square 1:1 (feed post)', w: 720, h: 720 },
  landscape: { label: 'Landscape 16:9 (YouTube)', w: 1280, h: 720 },
};

export const BACKGROUNDS = {
  aurora: { label: 'Aurora', colors: ['#ff3d81', '#6b5bff', '#3dd6ff'] },
  sunset: { label: 'Sunset', colors: ['#ff8a3d', '#ff3d81', '#ffd23f'] },
  particles: { label: 'Floating sparks', colors: ['#1b0b3a', '#ffd23f', '#42e6a4'] },
  stripes: { label: 'Speed stripes', colors: ['#111827', '#ff3d81', '#ffd23f'] },
  bokeh: { label: 'Soft bokeh', colors: ['#0f172a', '#3dd6ff', '#9b6bff'] },
  waves: { label: 'Ocean waves', colors: ['#0b3a53', '#3dd6ff', '#42e6a4'] },
  confetti: { label: 'Party confetti', colors: ['#fff7ed', '#ff3d81', '#6b5bff'] },
};

const uid = () => Math.random().toString(36).slice(2, 9);
const newScene = (o = {}) => ({ id: uid(), duration: 3, bg: { kind: 'animated', style: 'aurora' }, text: 'Your headline', subtext: '', color: '#ffffff', position: 'center', font: 'Outfit', ...o });

function rand(seed) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) / 2147483647);
}

function drawAnimated(ctx, W, H, style, t) {
  const c = BACKGROUNDS[style]?.colors ?? BACKGROUNDS.aurora.colors;
  if (style === 'aurora' || style === 'sunset') {
    const g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, c[0]);
    g.addColorStop(0.5 + 0.3 * Math.sin(t * 0.8), c[1]);
    g.addColorStop(1, c[2]);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 3; i++) {
      const x = W * (0.5 + 0.4 * Math.sin(t * 0.5 + i * 2));
      const y = H * (0.5 + 0.4 * Math.cos(t * 0.4 + i * 1.7));
      const r = ctx.createRadialGradient(x, y, 0, x, y, Math.max(W, H) * 0.5);
      r.addColorStop(0, `${c[(i + 1) % 3]}88`);
      r.addColorStop(1, `${c[(i + 1) % 3]}00`);
      ctx.fillStyle = r;
      ctx.fillRect(0, 0, W, H);
    }
    return;
  }
  ctx.fillStyle = c[0];
  ctx.fillRect(0, 0, W, H);
  const R = rand(7);
  if (style === 'particles' || style === 'bokeh') {
    const n = style === 'particles' ? 70 : 22;
    for (let i = 0; i < n; i++) {
      const bx = R() * W, by = R() * H, sp = 0.2 + R() * 0.8, size = style === 'particles' ? 2 + R() * 5 : 30 + R() * 90;
      const y = (by - t * sp * 60 + H * 10) % (H + size * 2) - size;
      const x = bx + Math.sin(t * sp + i) * 20;
      ctx.globalAlpha = style === 'particles' ? 0.5 + 0.5 * Math.sin(t * 3 + i) : 0.25;
      ctx.fillStyle = c[1 + (i % 2)];
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  } else if (style === 'stripes') {
    ctx.save();
    ctx.translate(W / 2, H / 2);
    ctx.rotate(-Math.PI / 6);
    const span = Math.hypot(W, H);
    for (let i = -20; i < 20; i++) {
      ctx.fillStyle = c[1 + (Math.abs(i) % 2)];
      ctx.globalAlpha = 0.35;
      ctx.fillRect(-span, i * 90 + ((t * 120) % 180), span * 2, 36);
    }
    ctx.restore();
    ctx.globalAlpha = 1;
  } else if (style === 'waves') {
    for (let k = 0; k < 4; k++) {
      ctx.fillStyle = c[1 + (k % 2)];
      ctx.globalAlpha = 0.22 + k * 0.08;
      ctx.beginPath();
      ctx.moveTo(0, H);
      for (let x = 0; x <= W; x += 16) ctx.lineTo(x, H * (0.55 + k * 0.1) + Math.sin(x / 90 + t * (1 + k * 0.3) + k) * 30);
      ctx.lineTo(W, H);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  } else if (style === 'confetti') {
    for (let i = 0; i < 90; i++) {
      const bx = R() * W, sp = 0.4 + R(), rot = R() * 6;
      const y = ((R() * H + t * sp * 120) % (H + 40)) - 20;
      ctx.save();
      ctx.translate(bx + Math.sin(t + i) * 15, y);
      ctx.rotate(rot + t * sp * 2);
      ctx.fillStyle = c[1 + (i % 2)];
      ctx.fillRect(-8, -4, 16, 8);
      ctx.restore();
    }
  }
}

function drawCover(ctx, W, H, media) {
  const mw = media.videoWidth || media.width, mh = media.videoHeight || media.height;
  if (!mw || !mh) return;
  const s = Math.max(W / mw, H / mh);
  ctx.drawImage(media, (W - mw * s) / 2, (H - mh * s) / 2, mw * s, mh * s);
}

function wrap(ctx, text, max) {
  const lines = [];
  for (const para of String(text).split('\n')) {
    let line = '';
    for (const w of para.split(' ')) {
      const t = line ? `${line} ${w}` : w;
      if (ctx.measureText(t).width > max && line) { lines.push(line); line = w; } else line = t;
    }
    lines.push(line);
  }
  return lines;
}

/** Draw one frame of a scene at time t (seconds into the scene). */
function drawScene(ctx, W, H, scene, t, media) {
  ctx.globalAlpha = 1;
  if (scene.bg.kind === 'animated') drawAnimated(ctx, W, H, scene.bg.style, t);
  else if (media) {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, W, H);
    const zoom = scene.bg.kind === 'image' ? 1 + 0.06 * (t / scene.duration) : 1; // gentle Ken Burns
    ctx.save();
    ctx.translate(W / 2, H / 2);
    ctx.scale(zoom, zoom);
    ctx.translate(-W / 2, -H / 2);
    drawCover(ctx, W, H, media);
    ctx.restore();
    const shade = ctx.createLinearGradient(0, 0, 0, H);
    shade.addColorStop(0, 'rgba(0,0,0,0.15)');
    shade.addColorStop(1, 'rgba(0,0,0,0.45)');
    ctx.fillStyle = shade;
    ctx.fillRect(0, 0, W, H);
  }
  // animated text: slide + fade in, fade out at the end
  const inP = Math.min(1, t / 0.5);
  const outP = Math.min(1, Math.max(0, (scene.duration - t) / 0.35));
  const a = Math.min(inP, outP);
  const ease = 1 - (1 - inP) ** 3;
  const size = Math.round(Math.min(W, H) * 0.085);
  ctx.font = `800 ${size}px "${scene.font}", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  const lines = scene.text ? wrap(ctx, scene.text, W * 0.84) : [];
  const subSize = Math.round(size * 0.48);
  const blockH = lines.length * size * 1.1 + (scene.subtext ? subSize * 1.6 : 0);
  const y0 = scene.position === 'top' ? H * 0.12 : scene.position === 'bottom' ? H * 0.86 - blockH : (H - blockH) / 2;
  ctx.globalAlpha = a;
  ctx.shadowColor = 'rgba(0,0,0,0.45)';
  ctx.shadowBlur = 18;
  ctx.fillStyle = scene.color;
  lines.forEach((l, i) => ctx.fillText(l, W / 2, y0 + i * size * 1.1 + (1 - ease) * 40));
  if (scene.subtext) {
    ctx.font = `600 ${subSize}px "${scene.font}", sans-serif`;
    ctx.fillText(scene.subtext, W / 2, y0 + lines.length * size * 1.1 + subSize * 0.5 + (1 - ease) * 60);
  }
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;
}

export default function VideoMaker({ brand, onPostToShowcase, initialScenes, guardScenes }) {
  const [format, setFormat] = useState('vertical');
  const [scenes, setScenes] = useState(() => initialScenes?.length ? initialScenes : [
    newScene({ text: brand ? `Meet ${brand}` : 'Meet our brand', subtext: 'Made with care', bg: { kind: 'animated', style: 'aurora' } }),
    newScene({ text: 'Here\'s why people love it', bg: { kind: 'animated', style: 'particles' } }),
    newScene({ text: 'Try it today', subtext: 'Link in bio', bg: { kind: 'animated', style: 'sunset' }, duration: 3.5 }),
  ]);
  const [selId, setSelId] = useState(null);
  const [music, setMusic] = useState('pop');
  const [volume, setVolume] = useState(0.8);
  const [title, setTitle] = useState(brand ? `${brand} promo` : 'My promo');
  const [state, setState] = useState('idle'); // idle | playing | recording
  const [progress, setProgress] = useState(0);
  const [lastVideo, setLastVideo] = useState(null);
  const [error, setError] = useState(null);
  const canvasRef = useRef(null);
  const media = useRef({}); // scene id -> HTMLImageElement | HTMLVideoElement
  const stopRef = useRef(null);
  const fileRef = useRef(null);
  const beatStop = useRef(null);

  const { w: W, h: H } = FORMATS[format];
  const total = scenes.reduce((s, x) => s + x.duration, 0);
  const sel = scenes.find((s) => s.id === selId) ?? scenes[0];

  const update = (id, patch) => setScenes((ss) => ss.map((s) => (s.id === id ? { ...s, ...patch } : s)));

  // draw the selected scene's first second as a still preview when idle
  useEffect(() => {
    if (state !== 'idle' || !canvasRef.current || !sel) return;
    const ctx = canvasRef.current.getContext('2d');
    document.fonts?.load(`800 40px "${sel.font}"`).finally(() => drawScene(ctx, W, H, sel, Math.min(1, sel.duration / 2), media.current[sel.id]));
  }, [sel, state, W, H, scenes]);

  useEffect(() => () => { stopRef.current?.(); beatStop.current?.(); }, []);

  async function addMedia(file) {
    if (!file || !sel) return;
    const url = URL.createObjectURL(file);
    if (file.type.startsWith('image/')) {
      const img = new Image();
      img.src = url;
      await img.decode().catch(() => {});
      media.current[sel.id] = img;
      update(sel.id, { bg: { kind: 'image', name: file.name } });
    } else if (file.type.startsWith('video/')) {
      const v = document.createElement('video');
      v.src = url;
      v.muted = true;
      v.playsInline = true;
      v.loop = true;
      await new Promise((r) => { v.onloadeddata = r; v.onerror = r; });
      media.current[sel.id] = v;
      update(sel.id, { bg: { kind: 'video', name: file.name }, duration: Math.min(10, Math.max(1, Math.round(v.duration || 3))) });
    }
  }

  /** Runs the timeline on the canvas in real time; resolves when finished. */
  function runTimeline(onDone) {
    const ctx = canvasRef.current.getContext('2d');
    const start = performance.now();
    let raf;
    let currentId = null;
    const tick = () => {
      const t = (performance.now() - start) / 1000;
      setProgress(Math.min(1, t / total));
      if (t >= total) { onDone(); return; }
      let acc = 0;
      for (const s of scenes) {
        if (t < acc + s.duration) {
          const m = media.current[s.id];
          if (s.id !== currentId) {
            currentId = s.id;
            if (m instanceof HTMLVideoElement) { m.currentTime = 0; m.play().catch(() => {}); }
          }
          drawScene(ctx, W, H, s, t - acc, m);
          break;
        }
        acc += s.duration;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }

  async function play() {
    setError(null);
    await Promise.all(scenes.map((s) => document.fonts?.load(`800 40px "${s.font}"`).catch(() => {})));
    setState('playing');
    if (music !== 'none') beatStop.current = previewBeat(music, total, volume);
    const cancel = runTimeline(() => stop());
    stopRef.current = () => { cancel(); beatStop.current?.(); beatStop.current = null; };
  }

  function stop() {
    stopRef.current?.();
    stopRef.current = null;
    setState('idle');
    setProgress(0);
    Object.values(media.current).forEach((m) => m instanceof HTMLVideoElement && m.pause());
  }

  async function record() {
    setError(null);
    const verdict = guardScenes?.(scenes);
    if (verdict && !verdict.ok) {
      setError(`🛡️ ${verdict.message}`);
      return;
    }
    if (!window.MediaRecorder || !canvasRef.current.captureStream) {
      setError('Your browser cannot record video. Try the latest Chrome, Edge or Firefox.');
      return;
    }
    await Promise.all(scenes.map((s) => document.fonts?.load(`800 40px "${s.font}"`).catch(() => {})));
    const stream = canvasRef.current.captureStream(30);
    let actx = null;
    if (music !== 'none') {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      actx = new Ctx();
      const dest = actx.createMediaStreamDestination();
      scheduleBeat(actx, dest, music, actx.currentTime + 0.05, total, volume);
      scheduleBeat(actx, actx.destination, music, actx.currentTime + 0.05, total, volume * 0.6); // hear it while recording
      dest.stream.getAudioTracks().forEach((tr) => stream.addTrack(tr));
    }
    const type = ['video/mp4;codecs=avc1', 'video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm'].find((m) => MediaRecorder.isTypeSupported(m)) ?? '';
    const rec = new MediaRecorder(stream, { mimeType: type, videoBitsPerSecond: 5_000_000 });
    const chunks = [];
    rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
    rec.onstop = () => {
      const blob = new Blob(chunks, { type: (rec.mimeType || 'video/webm').split(';')[0] });
      const ext = blob.type.includes('mp4') ? 'mp4' : 'webm';
      const file = new File([blob], `${safeName(title)}.${ext}`, { type: blob.type });
      setLastVideo(file);
      downloadBlob(blob, file.name);
      actx?.close().catch(() => {});
      setState('idle');
      setProgress(0);
    };
    setState('recording');
    rec.start(250);
    const cancel = runTimeline(() => rec.state !== 'inactive' && rec.stop());
    stopRef.current = () => { cancel(); if (rec.state !== 'inactive') rec.stop(); };
  }

  const busy = state !== 'idle';

  return (
    <div className="videomaker">
      <div className="designer-bar">
        <input type="text" aria-label="Video title" className="designer-name" value={title} maxLength={80} onChange={(e) => setTitle(e.target.value)} />
        <select aria-label="Format" value={format} onChange={(e) => setFormat(e.target.value)} disabled={busy}>
          {Object.entries(FORMATS).map(([k, f]) => <option key={k} value={k}>{f.label}</option>)}
        </select>
        <span className="chip">⏱ {total.toFixed(1)}s</span>
        {state === 'idle' ? (
          <>
            <button className="btn btn-sm" onClick={play}>▶ Preview</button>
            <button className="btn btn-sm btn-primary" onClick={record}>⬇️ Export video</button>
          </>
        ) : (
          <button className="btn btn-sm btn-danger" onClick={stop}>■ Stop</button>
        )}
      </div>
      {error && <div className="alert alert-error small">{error}</div>}

      <div className="designer-body">
        <aside className="designer-tools" aria-label="Scenes">
          <p className="designer-label">Scenes</p>
          <ol className="scene-list">
            {scenes.map((s, i) => (
              <li key={s.id}>
                <button className={`scene-btn ${sel?.id === s.id ? 'is-active' : ''}`} onClick={() => setSelId(s.id)} disabled={busy}>
                  <span className="scene-num">{i + 1}</span>
                  <span className="scene-txt">{s.text || '(no text)'}<small>{s.duration}s · {s.bg.kind === 'animated' ? BACKGROUNDS[s.bg.style].label : s.bg.kind === 'image' ? 'Photo' : 'Clip'}</small></span>
                </button>
              </li>
            ))}
          </ol>
          <button className="btn btn-sm" disabled={busy || scenes.length >= 12} onClick={() => { const s = newScene({ bg: { kind: 'animated', style: Object.keys(BACKGROUNDS)[scenes.length % 7] } }); setScenes([...scenes, s]); setSelId(s.id); }}>＋ Add scene</button>

          <p className="designer-label">🎵 Free music</p>
          <div className="music-grid">
            <button className={`choice ${music === 'none' ? 'is-on' : ''}`} aria-pressed={music === 'none'} onClick={() => setMusic('none')} disabled={busy}>🔇 None</button>
            {Object.entries(BEAT_STYLES).map(([k, b]) => (
              <button key={k} className={`choice ${music === k ? 'is-on' : ''}`} aria-pressed={music === k} onClick={() => setMusic(k)} disabled={busy}>{b.emoji} {b.label}</button>
            ))}
          </div>
          <label className="small">Volume<input type="range" min="0.1" max="1" step="0.05" value={volume} onChange={(e) => setVolume(+e.target.value)} disabled={busy} /></label>
          <p className="hint">Music is generated by Marketcraft, so it's original and free to use anywhere.</p>
        </aside>

        <div className="designer-stage">
          <div className="video-stage" style={{ aspectRatio: `${W} / ${H}`, maxWidth: format === 'vertical' ? 340 : format === 'square' ? 480 : 640 }}>
            <canvas ref={canvasRef} width={W} height={H} aria-label="Video preview" />
          </div>
          {busy && (
            <div style={{ maxWidth: 480, margin: '10px auto 0' }}>
              <div className="progress"><span style={{ width: `${progress * 100}%` }} /></div>
              <p className="hint" style={{ textAlign: 'center' }}>{state === 'recording' ? 'Recording your video… keep this tab open.' : 'Playing preview…'}</p>
            </div>
          )}
          {lastVideo && !busy && (
            <div className="alert alert-success small" style={{ maxWidth: 520, margin: '12px auto 0' }}>
              ✅ Video ready: <b>{lastVideo.name}</b>.
              {onPostToShowcase && <button className="btn btn-sm" style={{ marginLeft: 8 }} onClick={() => onPostToShowcase(lastVideo, title)}>🎥 Add to my Showcase</button>}
            </div>
          )}
        </div>

        <aside className="designer-inspector" aria-label="Scene settings">
          {sel && (
            <div className="stack" style={{ '--gap': '10px' }}>
              <p className="designer-label">Scene {scenes.indexOf(sel) + 1}</p>
              <label className="small">Headline<textarea value={sel.text} maxLength={80} onChange={(e) => update(sel.id, { text: e.target.value })} style={{ minHeight: 60 }} disabled={busy} /></label>
              <label className="small">Small text<input type="text" value={sel.subtext} maxLength={60} onChange={(e) => update(sel.id, { subtext: e.target.value })} disabled={busy} /></label>
              <div className="row" style={{ gap: 6 }}>
                {['top', 'center', 'bottom'].map((p) => <button key={p} className={`btn btn-sm ${sel.position === p ? 'btn-primary' : ''}`} onClick={() => update(sel.id, { position: p })} disabled={busy}>{p}</button>)}
              </div>
              <div className="row" style={{ gap: 6 }}>
                <select aria-label="Font" value={sel.font} onChange={(e) => update(sel.id, { font: e.target.value })} disabled={busy}>
                  {['Outfit', 'Fredoka', 'Bebas Neue', 'Playfair Display', 'Pacifico'].map((f) => <option key={f}>{f}</option>)}
                </select>
                <input type="color" aria-label="Text colour" value={sel.color} onChange={(e) => update(sel.id, { color: e.target.value })} disabled={busy} />
              </div>
              <label className="small">Length {sel.duration}s<input type="range" min="1" max="10" step="0.5" value={sel.duration} onChange={(e) => update(sel.id, { duration: +e.target.value })} disabled={busy} /></label>

              <p className="designer-label">Background</p>
              <div className="bg-grid">
                {Object.entries(BACKGROUNDS).map(([k, b]) => (
                  <button key={k} className={`bg-swatch ${sel.bg.kind === 'animated' && sel.bg.style === k ? 'is-on' : ''}`} style={{ background: `linear-gradient(135deg, ${b.colors.join(',')})` }} onClick={() => update(sel.id, { bg: { kind: 'animated', style: k } })} disabled={busy} title={b.label} aria-label={b.label} />
                ))}
              </div>
              <button className="btn btn-sm" onClick={() => fileRef.current?.click()} disabled={busy}>📷 Use my photo or clip</button>
              <input ref={fileRef} type="file" accept="image/*,video/mp4,video/webm,video/quicktime" hidden onChange={(e) => { addMedia(e.target.files[0]); e.target.value = ''; }} />
              {sel.bg.kind !== 'animated' && <p className="hint">Using: {sel.bg.name}. Clip sound is muted; your music plays instead.</p>}
              <div className="row" style={{ gap: 6 }}>
                <button className="btn btn-sm" disabled={busy || scenes.indexOf(sel) === 0} onClick={() => { const i = scenes.indexOf(sel); const s = [...scenes]; [s[i - 1], s[i]] = [s[i], s[i - 1]]; setScenes(s); }}>↑</button>
                <button className="btn btn-sm" disabled={busy || scenes.indexOf(sel) === scenes.length - 1} onClick={() => { const i = scenes.indexOf(sel); const s = [...scenes]; [s[i + 1], s[i]] = [s[i], s[i + 1]]; setScenes(s); }}>↓</button>
                <button className="btn btn-sm btn-danger" disabled={busy || scenes.length < 2} onClick={() => { setScenes(scenes.filter((s) => s.id !== sel.id)); setSelId(null); }}>🗑 Remove</button>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
