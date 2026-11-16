// Design Studio: a small Canva-style editor for posts, stories, flyers and posters.
// The document is plain JSON (saved to the server); export draws it onto a <canvas>.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { downloadBlob, safeName } from '../lib/download.js';
import { buildTemplates, TEMPLATE_CATEGORIES } from './templates.js';

export const PRESETS = {
  'instagram-post': { label: 'Instagram post', w: 1080, h: 1080 },
  story: { label: 'Story / Reel cover', w: 1080, h: 1920 },
  'social-wide': { label: 'Facebook / X post', w: 1200, h: 675 },
  flyer: { label: 'Flyer (US Letter)', w: 1275, h: 1650 },
  poster: { label: 'Poster (2:3)', w: 1200, h: 1800 },
  thumbnail: { label: 'YouTube thumbnail', w: 1280, h: 720 },
};

export const FONTS = ['Outfit', 'Fredoka', 'Bebas Neue', 'Playfair Display', 'Pacifico', 'Georgia', 'Courier New'];
const SWATCHES = ['#ffffff', '#111827', '#ff3d81', '#ff8a3d', '#ffd23f', '#42e6a4', '#3dd6ff', '#6b5bff', '#9b6bff', '#1b0b3a', '#f5efe6', '#0f766e'];
const uid = () => Math.random().toString(36).slice(2, 9);

const text = (o) => ({ id: uid(), type: 'text', x: 80, y: 80, w: 600, h: 120, text: 'Your text', fontFamily: 'Outfit', fontSize: 72, fontWeight: 800, color: '#ffffff', align: 'left', lineHeight: 1.15, opacity: 1, ...o });
const rect = (o) => ({ id: uid(), type: 'rect', x: 100, y: 100, w: 400, h: 240, fill: '#ff3d81', radius: 24, opacity: 1, ...o });
const circle = (o) => ({ id: uid(), type: 'circle', x: 100, y: 100, w: 300, h: 300, fill: '#ffd23f', opacity: 1, ...o });

export function blankDoc(preset = 'instagram-post') {
  const p = PRESETS[preset];
  return { preset, width: p.w, height: p.h, background: { type: 'solid', color: '#1b0b3a' }, elements: [] };
}

// ---- rendering helpers -------------------------------------------------------------
export function bgCss(bg) {
  return bg.type === 'gradient' ? { background: `linear-gradient(${bg.angle ?? 135}deg, ${bg.color}, ${bg.color2})` } : { background: bg.color };
}

export function elStyle(el) {
  return {
    left: el.x, top: el.y, width: el.w, height: el.type === 'text' ? 'auto' : el.h, minHeight: el.type === 'text' ? el.fontSize * el.lineHeight : undefined,
    opacity: el.opacity, transform: el.rotation ? `rotate(${el.rotation}deg)` : undefined,
    ...(el.type === 'rect' ? { background: el.fill, borderRadius: el.radius } : {}),
    ...(el.type === 'circle' ? { background: el.fill, borderRadius: '50%' } : {}),
    ...(el.type === 'image' ? { backgroundImage: `url(${el.src})`, backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: el.radius } : {}),
    ...(el.type === 'text' ? { fontFamily: `"${el.fontFamily}", sans-serif`, fontSize: el.fontSize, fontWeight: el.fontWeight, color: el.color, textAlign: el.align, lineHeight: el.lineHeight } : {}),
  };
}

/** Read-only miniature of a design (template gallery, saved-design list). */
export function DocPreview({ doc, width = 200 }) {
  const scale = width / doc.width;
  return (
    <div className="doc-preview" style={{ width, height: doc.height * scale }} aria-hidden>
      <div className="artboard" style={{ width: doc.width, height: doc.height, transform: `scale(${scale})`, ...bgCss(doc.background) }}>
        {doc.elements.map((el) => <div key={el.id} className={`el el-${el.type}`} style={elStyle(el)}>{el.type === 'text' && el.text}</div>)}
      </div>
    </div>
  );
}

/** Template gallery; `fields` fills templates with the learner's (or AI's) words. */
export function TemplateGallery({ fields, onPick, presetFilter }) {
  const [cat, setCat] = useState('All');
  const all = useMemo(() => buildTemplates(fields), [fields]);
  const list = all.filter((t) => (cat === 'All' || t.category === cat) && (!presetFilter || t.doc.preset === presetFilter));
  return (
    <div className="stack" style={{ '--gap': '12px' }}>
      <div className="tabs" role="tablist" style={{ width: '100%' }}>
        {['All', ...TEMPLATE_CATEGORIES].map((c) => <button key={c} role="tab" className="tab" aria-selected={cat === c} onClick={() => setCat(c)}>{c}</button>)}
      </div>
      <div className="template-grid">
        {list.map((t) => (
          <button key={t.name} className="template-card" onClick={() => onPick(structuredClone(t.doc), t.name)}>
            <DocPreview doc={t.doc} width={180} />
            <b>{t.name}</b>
            <span className="muted small">{PRESETS[t.doc.preset]?.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ---- export ------------------------------------------------------------------------
function wrapLines(ctx, str, maxWidth) {
  const out = [];
  for (const para of String(str).split('\n')) {
    const words = para.split(' ');
    let line = '';
    for (const w of words) {
      const test = line ? `${line} ${w}` : w;
      if (ctx.measureText(test).width > maxWidth && line) {
        out.push(line);
        line = w;
      } else line = test;
    }
    out.push(line);
  }
  return out;
}

const loadImage = (src) => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });

export async function renderDoc(doc, scale = 1) {
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(doc.width * scale);
  canvas.height = Math.round(doc.height * scale);
  const ctx = canvas.getContext('2d');
  ctx.scale(scale, scale);
  const bg = doc.background;
  if (bg.type === 'gradient') {
    const a = ((bg.angle ?? 135) * Math.PI) / 180;
    const cx = doc.width / 2, cy = doc.height / 2, r = Math.hypot(doc.width, doc.height) / 2;
    const g = ctx.createLinearGradient(cx - Math.sin(a) * r, cy + Math.cos(a) * r, cx + Math.sin(a) * r, cy - Math.cos(a) * r);
    g.addColorStop(0, bg.color);
    g.addColorStop(1, bg.color2);
    ctx.fillStyle = g;
  } else ctx.fillStyle = bg.color;
  ctx.fillRect(0, 0, doc.width, doc.height);

  await Promise.all(doc.elements.filter((e) => e.type === 'text').map((e) => document.fonts?.load(`${e.fontWeight} ${e.fontSize}px "${e.fontFamily}"`).catch(() => {})));

  for (const e of doc.elements) {
    ctx.save();
    ctx.globalAlpha = e.opacity ?? 1;
    if (e.rotation) {
      ctx.translate(e.x + e.w / 2, e.y + e.h / 2);
      ctx.rotate((e.rotation * Math.PI) / 180);
      ctx.translate(-(e.x + e.w / 2), -(e.y + e.h / 2));
    }
    if (e.type === 'rect') {
      ctx.fillStyle = e.fill;
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(e.x, e.y, e.w, e.h, Math.min(e.radius ?? 0, e.w / 2, e.h / 2)) : ctx.rect(e.x, e.y, e.w, e.h);
      ctx.fill();
    } else if (e.type === 'circle') {
      ctx.fillStyle = e.fill;
      ctx.beginPath();
      ctx.ellipse(e.x + e.w / 2, e.y + e.h / 2, e.w / 2, e.h / 2, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (e.type === 'image') {
      const img = await loadImage(e.src).catch(() => null);
      if (img) {
        const s = Math.max(e.w / img.width, e.h / img.height);
        const sw = e.w / s, sh = e.h / s;
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(e.x, e.y, e.w, e.h, e.radius ?? 0) : ctx.rect(e.x, e.y, e.w, e.h);
        ctx.clip();
        ctx.drawImage(img, (img.width - sw) / 2, (img.height - sh) / 2, sw, sh, e.x, e.y, e.w, e.h);
      }
    } else if (e.type === 'text') {
      ctx.font = `${e.fontWeight} ${e.fontSize}px "${e.fontFamily}", sans-serif`;
      ctx.fillStyle = e.color;
      ctx.textBaseline = 'top';
      ctx.textAlign = e.align;
      const lh = e.fontSize * e.lineHeight;
      const x = e.align === 'center' ? e.x + e.w / 2 : e.align === 'right' ? e.x + e.w : e.x;
      wrapLines(ctx, e.text, e.w).forEach((line, i) => ctx.fillText(line, x, e.y + i * lh + (lh - e.fontSize) / 2));
    }
    ctx.restore();
  }
  return canvas;
}

async function shrinkImage(file, max = 1600) {
  const src = await new Promise((res) => { const r = new FileReader(); r.onload = () => res(r.result); r.readAsDataURL(file); });
  const img = await loadImage(src);
  const s = Math.min(1, max / Math.max(img.width, img.height));
  const c = document.createElement('canvas');
  c.width = Math.round(img.width * s);
  c.height = Math.round(img.height * s);
  c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
  return { src: c.toDataURL('image/jpeg', 0.85), w: c.width, h: c.height };
}

// ---- editor ------------------------------------------------------------------------
export default function DesignEditor({ initial, name: initialName = 'Untitled design', brand, onSave, saving, actions, guardDoc }) {
  const [doc, setDoc] = useState(initial ?? blankDoc());
  const [name, setName] = useState(initialName);
  const [sel, setSel] = useState(null);
  const [history, setHistory] = useState([]);
  const [exporting, setExporting] = useState(false);
  const [guardMsg, setGuardMsg] = useState(null);
  const wrapRef = useRef(null);
  const fileRef = useRef(null);
  const [boxW, setBoxW] = useState(600);

  useEffect(() => {
    const ro = new ResizeObserver(([e]) => setBoxW(e.contentRect.width));
    if (wrapRef.current) ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);

  const scale = Math.min(boxW / doc.width, 620 / doc.height, 1);
  const selected = doc.elements.find((e) => e.id === sel) ?? null;

  const commit = useCallback((next) => {
    setHistory((h) => [...h.slice(-40), doc]);
    setDoc(next);
  }, [doc]);
  const update = (id, patch, record = true) => {
    const next = { ...doc, elements: doc.elements.map((e) => (e.id === id ? { ...e, ...patch } : e)) };
    record ? commit(next) : setDoc(next);
  };
  const add = (el) => { commit({ ...doc, elements: [...doc.elements, el] }); setSel(el.id); };
  const remove = (id) => { commit({ ...doc, elements: doc.elements.filter((e) => e.id !== id) }); setSel(null); };
  const undo = () => setHistory((h) => { if (!h.length) return h; setDoc(h[h.length - 1]); return h.slice(0, -1); });
  const move = (id, dir) => {
    const i = doc.elements.findIndex((e) => e.id === id);
    const j = dir === 'up' ? i + 1 : i - 1;
    if (j < 0 || j >= doc.elements.length) return;
    const els = [...doc.elements];
    [els[i], els[j]] = [els[j], els[i]];
    commit({ ...doc, elements: els });
  };

  // keyboard: delete / nudge / undo (ignored while typing in a field)
  useEffect(() => {
    const onKey = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); undo(); return; }
      if (!selected) return;
      if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); remove(selected.id); }
      const d = e.shiftKey ? 20 : 4;
      const nudge = { ArrowLeft: [-d, 0], ArrowRight: [d, 0], ArrowUp: [0, -d], ArrowDown: [0, d] }[e.key];
      if (nudge) { e.preventDefault(); update(selected.id, { x: selected.x + nudge[0], y: selected.y + nudge[1] }); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  // drag & resize with pointer events
  function startDrag(e, el, mode) {
    e.stopPropagation();
    e.preventDefault();
    setSel(el.id);
    const sx = e.clientX, sy = e.clientY;
    const start = { ...el };
    setHistory((h) => [...h.slice(-40), doc]);
    const onMove = (ev) => {
      const dx = (ev.clientX - sx) / scale, dy = (ev.clientY - sy) / scale;
      const patch = mode === 'move'
        ? { x: Math.round(start.x + dx), y: Math.round(start.y + dy) }
        : { w: Math.max(20, Math.round(start.w + dx)), h: Math.max(20, Math.round(start.h + dy)) };
      setDoc((d) => ({ ...d, elements: d.elements.map((x) => (x.id === el.id ? { ...x, ...patch } : x)) }));
    };
    const onUp = () => { window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', onUp); };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  }

  async function addImage(file) {
    if (!file?.type.startsWith('image/')) return;
    const img = await shrinkImage(file);
    const w = Math.min(doc.width * 0.7, img.w);
    add({ id: uid(), type: 'image', x: Math.round((doc.width - w) / 2), y: Math.round(doc.height * 0.2), w: Math.round(w), h: Math.round((w * img.h) / img.w), src: img.src, radius: 0, opacity: 1 });
  }

  function resize(preset) {
    const p = PRESETS[preset];
    const sx = p.w / doc.width, sy = p.h / doc.height;
    commit({
      ...doc, preset, width: p.w, height: p.h,
      elements: doc.elements.map((e) => ({ ...e, x: Math.round(e.x * sx), y: Math.round(e.y * sy), w: Math.round(e.w * sx), h: Math.round(e.h * sy), ...(e.fontSize ? { fontSize: Math.round(e.fontSize * Math.min(sx, sy)) } : {}) })),
    });
  }

  async function exportAs(type) {
    const verdict = guardDoc?.(doc);
    if (verdict && !verdict.ok) {
      setGuardMsg(verdict.message);
      return;
    }
    setGuardMsg(null);
    setExporting(true);
    try {
      const canvas = await renderDoc(doc);
      const blob = await new Promise((r) => canvas.toBlob(r, type, 0.92));
      downloadBlob(blob, `${safeName(name)}.${type === 'image/png' ? 'png' : 'jpg'}`);
    } finally {
      setExporting(false);
    }
  }

  const bgStyle = bgCss(doc.background);
  const tpls = useMemo(() => buildTemplates({ brand }), [brand]);

  return (
    <div className="designer">
      <div className="designer-bar">
        <input type="text" aria-label="Design name" className="designer-name" value={name} maxLength={80} onChange={(e) => setName(e.target.value)} />
        <select aria-label="Size" value={doc.preset ?? ''} onChange={(e) => resize(e.target.value)}>
          {Object.entries(PRESETS).map(([k, p]) => <option key={k} value={k}>{p.label} · {p.w}×{p.h}</option>)}
        </select>
        <button className="btn btn-sm" onClick={undo} disabled={!history.length} title="Undo (Ctrl+Z)">↶ Undo</button>
        {onSave && <button className="btn btn-sm" onClick={() => onSave({ name, doc })} disabled={saving}>{saving ? 'Saving…' : '💾 Save'}</button>}
        <button className="btn btn-sm btn-primary" onClick={() => exportAs('image/png')} disabled={exporting}>⬇️ PNG</button>
        <button className="btn btn-sm" onClick={() => exportAs('image/jpeg')} disabled={exporting}>JPG</button>
        {actions?.({ doc, name })}
      </div>
      {guardMsg && <div className="alert alert-error small" role="alert">🛡️ {guardMsg}</div>}

      <div className="designer-body">
        <aside className="designer-tools" aria-label="Add elements">
          <p className="designer-label">Add</p>
          <button className="btn btn-sm" onClick={() => add(text({ text: 'Big headline', fontSize: Math.round(doc.width / 12), w: Math.round(doc.width * 0.8), x: Math.round(doc.width * 0.1), y: Math.round(doc.height * 0.1) }))}>T Heading</button>
          <button className="btn btn-sm" onClick={() => add(text({ text: 'Add some details here', fontSize: Math.round(doc.width / 26), fontWeight: 500, w: Math.round(doc.width * 0.8), x: Math.round(doc.width * 0.1), y: Math.round(doc.height * 0.4) }))}>T Body text</button>
          <button className="btn btn-sm" onClick={() => add(rect({ x: Math.round(doc.width * 0.1), y: Math.round(doc.height * 0.6), w: Math.round(doc.width * 0.5), h: Math.round(doc.height * 0.12) }))}>▭ Box</button>
          <button className="btn btn-sm" onClick={() => add(circle({ x: Math.round(doc.width * 0.6), y: Math.round(doc.height * 0.1), w: Math.round(doc.width * 0.3), h: Math.round(doc.width * 0.3) }))}>● Circle</button>
          <button className="btn btn-sm" onClick={() => fileRef.current?.click()}>🖼 Photo</button>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => { addImage(e.target.files[0]); e.target.value = ''; }} />

          <p className="designer-label">Background</p>
          <div className="row" style={{ gap: 6 }}>
            <button className={`btn btn-sm ${doc.background.type === 'solid' ? 'btn-primary' : ''}`} onClick={() => commit({ ...doc, background: { ...doc.background, type: 'solid' } })}>Solid</button>
            <button className={`btn btn-sm ${doc.background.type === 'gradient' ? 'btn-primary' : ''}`} onClick={() => commit({ ...doc, background: { color2: '#6b5bff', angle: 135, ...doc.background, type: 'gradient' } })}>Gradient</button>
          </div>
          <label className="small">Colour<input type="color" value={doc.background.color} onChange={(e) => setDoc({ ...doc, background: { ...doc.background, color: e.target.value } })} /></label>
          {doc.background.type === 'gradient' && (
            <label className="small">Colour 2<input type="color" value={doc.background.color2} onChange={(e) => setDoc({ ...doc, background: { ...doc.background, color2: e.target.value } })} /></label>
          )}

          <p className="designer-label">Templates ({tpls.length})</p>
          {tpls.filter((t) => t.doc.preset === doc.preset).map((t) => (
            <button key={t.name} className="btn btn-sm btn-ghost" style={{ justifyContent: 'flex-start' }} onClick={() => { commit(structuredClone(t.doc)); setSel(null); }}>{t.name}</button>
          ))}
          <p className="hint">More sizes: change the size above, or pick from the full gallery.</p>
        </aside>

        <div className="designer-stage" ref={wrapRef} onPointerDown={() => setSel(null)}>
          <div className="artboard-wrap" style={{ width: doc.width * scale, height: doc.height * scale }}>
            <div className="artboard" style={{ width: doc.width, height: doc.height, transform: `scale(${scale})`, ...bgStyle }}>
              {doc.elements.map((el) => (
                <div
                  key={el.id}
                  className={`el el-${el.type} ${sel === el.id ? 'is-selected' : ''}`}
                  style={{ ...elStyle(el), '--handle': `${Math.max(14, 14 / scale)}px` }}
                  onPointerDown={(e) => startDrag(e, el, 'move')}
                >
                  {el.type === 'text' && el.text}
                  {sel === el.id && <span className="resize-handle" onPointerDown={(e) => startDrag(e, el, 'resize')} aria-hidden />}
                </div>
              ))}
            </div>
          </div>
          <p className="hint" style={{ textAlign: 'center' }}>Drag to move · corner handle to resize · Delete key removes · Ctrl+Z undo</p>
        </div>

        <aside className="designer-inspector" aria-label="Selected element">
          {!selected ? (
            <p className="muted small">Select something on the design to edit it, or add text, shapes and photos from the left.</p>
          ) : (
            <div className="stack" style={{ '--gap': '10px' }}>
              <p className="designer-label">{selected.type === 'text' ? 'Text' : selected.type === 'image' ? 'Photo' : 'Shape'}</p>
              {selected.type === 'text' && (
                <>
                  <textarea aria-label="Text" value={selected.text} onChange={(e) => update(selected.id, { text: e.target.value }, false)} style={{ minHeight: 70 }} />
                  <select aria-label="Font" value={selected.fontFamily} onChange={(e) => update(selected.id, { fontFamily: e.target.value })}>
                    {FONTS.map((f) => <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>)}
                  </select>
                  <label className="small">Size {selected.fontSize}px<input type="range" min="12" max="300" value={selected.fontSize} onChange={(e) => update(selected.id, { fontSize: +e.target.value }, false)} /></label>
                  <div className="row" style={{ gap: 6 }}>
                    {[400, 600, 800].map((w) => <button key={w} className={`btn btn-sm ${selected.fontWeight === w ? 'btn-primary' : ''}`} onClick={() => update(selected.id, { fontWeight: w })} style={{ fontWeight: w }}>{w === 400 ? 'Regular' : w === 600 ? 'Semi' : 'Bold'}</button>)}
                  </div>
                  <div className="row" style={{ gap: 6 }}>
                    {['left', 'center', 'right'].map((a) => <button key={a} className={`btn btn-sm ${selected.align === a ? 'btn-primary' : ''}`} onClick={() => update(selected.id, { align: a })}>{a === 'left' ? '⇤' : a === 'center' ? '≡' : '⇥'}</button>)}
                  </div>
                </>
              )}
              {selected.type !== 'image' && (
                <div className="swatches" role="group" aria-label="Colour">
                  {SWATCHES.map((c) => <button key={c} className="swatch" style={{ background: c }} aria-label={c} onClick={() => update(selected.id, selected.type === 'text' ? { color: c } : { fill: c })} />)}
                  <input type="color" aria-label="Custom colour" value={selected.type === 'text' ? selected.color : selected.fill} onChange={(e) => update(selected.id, selected.type === 'text' ? { color: e.target.value } : { fill: e.target.value }, false)} />
                </div>
              )}
              {(selected.type === 'rect' || selected.type === 'image') && (
                <label className="small">Corners<input type="range" min="0" max="300" value={selected.radius ?? 0} onChange={(e) => update(selected.id, { radius: +e.target.value }, false)} /></label>
              )}
              <label className="small">Opacity<input type="range" min="0.1" max="1" step="0.05" value={selected.opacity ?? 1} onChange={(e) => update(selected.id, { opacity: +e.target.value }, false)} /></label>
              <label className="small">Rotate {selected.rotation ?? 0}°<input type="range" min="-45" max="45" value={selected.rotation ?? 0} onChange={(e) => update(selected.id, { rotation: +e.target.value }, false)} /></label>
              <div className="row" style={{ gap: 6 }}>
                <button className="btn btn-sm" onClick={() => move(selected.id, 'up')} title="Bring forward">⬆ Forward</button>
                <button className="btn btn-sm" onClick={() => move(selected.id, 'down')} title="Send backward">⬇ Back</button>
              </div>
              <div className="row" style={{ gap: 6 }}>
                <button className="btn btn-sm" onClick={() => add({ ...selected, id: uid(), x: selected.x + 30, y: selected.y + 30 })}>⧉ Duplicate</button>
                <button className="btn btn-sm btn-danger" onClick={() => remove(selected.id)}>🗑 Delete</button>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
