// Creator: describe what you want, get finished designs (and video scenes) to edit.
import { useState } from 'react';
import { createDesigns, createVideoScenes, understand, aiPicture, withPicture } from '../lib/creator.js';
import { DocPreview, PRESETS, renderDoc } from './DesignEditor.jsx';
import { downloadBlob, safeName } from '../lib/download.js';
import { useUI } from '../store/ui.js';
import { SendToCanvaButton } from './CanvaConnect.jsx';

const EXAMPLES = [
  'A bright, fun Instagram post for my lemonade stand summer sale, 20% off this Saturday',
  'An elegant gold and black flyer for a candle pop-up at the Main Street market, Dec 5, 10am-2pm',
  'A modern YouTube thumbnail for "How I made my first $100"',
  'A cozy autumn story announcing our new pumpkin cookies',
  'A short video for my dog-walking service, friendly and playful',
  'A minimal poster: "Free coding workshop for teens" on Friday at the library',
];

const OCCASION_LABEL = { sale: 'Sale / offer', giveaway: 'Giveaway', event: 'Event', launch: 'Launch / news', hiring: 'Hiring', thanks: 'Thank-you', tip: 'Tip', general: 'General promo' };

export default function Creator({ brand, onEdit, onVideo, canvaConnected }) {
  const [prompt, setPrompt] = useState('');
  const [format, setFormat] = useState('auto');
  const [picture, setPicture] = useState(false);
  const [out, setOut] = useState(null);
  const [busy, setBusy] = useState(false);
  const [picError, setPicError] = useState(null);
  const toast = useUI((s) => s.toast);

  const isVideo = format === 'video' || (format === 'auto' && understand(prompt).format === 'video');

  async function create(e) {
    e?.preventDefault();
    if (prompt.trim().length < 6) return;
    setBusy(true);
    setPicError(null);
    try {
      if (isVideo) {
        onVideo(createVideoScenes(prompt, { brand }));
        return;
      }
      const made = createDesigns(prompt, { brand, format });
      setOut(made);
      if (picture) {
        try {
          const { w, h } = PRESETS[made.preset];
          const s = 768 / Math.max(w, h);
          const src = await aiPicture(made.understood.subject + ', ' + prompt, { width: Math.round(w * s), height: Math.round(h * s) });
          setOut({ ...made, results: [...made.results.slice(0, 3).map((r) => ({ ...r, name: `${r.name} · AI picture`, doc: withPicture(r, src) })), ...made.results] });
        } catch (err) {
          setPicError(err.message);
        }
      }
    } finally {
      setBusy(false);
    }
  }

  async function download(r) {
    const canvas = await renderDoc(r.doc);
    const blob = await new Promise((ok) => canvas.toBlob(ok, 'image/png'));
    downloadBlob(blob, `${safeName(r.name)}.png`);
  }

  return (
    <div className="stack" style={{ '--gap': '18px' }}>
      <form className="card creator-box" onSubmit={create}>
        <h2 style={{ marginBottom: 4 }}>✨ Creator</h2>
        <p className="muted small" style={{ marginTop: 0 }}>Describe what you want to make. Mention the type (post, story, flyer, poster, thumbnail, video), the occasion, colours or mood, and details like dates, prices or a "quoted headline".</p>
        <label htmlFor="creator-prompt" className="sr-only">Describe your design</label>
        <textarea id="creator-prompt" className="creator-input" maxLength={400} value={prompt} onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g. A bright summer sale post for my lemonade stand, 20% off this Saturday"
          onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) create(); }} />
        <div className="row" style={{ gap: 6, margin: '10px 0' }}>
          {EXAMPLES.map((x) => <button type="button" key={x} className="chip" style={{ cursor: 'pointer' }} onClick={() => setPrompt(x)}>{x.length > 46 ? `${x.slice(0, 44)}…` : x}</button>)}
        </div>
        <div className="row" style={{ gap: 10 }}>
          <select aria-label="Format" value={format} onChange={(e) => setFormat(e.target.value)} style={{ width: 'auto' }}>
            <option value="auto">Format: decide for me</option>
            {Object.entries(PRESETS).map(([k, p]) => <option key={k} value={k}>{p.label}</option>)}
            <option value="video">Short video</option>
          </select>
          {!isVideo && (
            <label className="checkbox" style={{ margin: 0 }}>
              <input type="checkbox" checked={picture} onChange={(e) => setPicture(e.target.checked)} />
              <span className="small">Add a free AI picture <span className="muted">(beta, takes ~20s)</span></span>
            </label>
          )}
          <button className="btn btn-primary" disabled={busy || prompt.trim().length < 6}>{busy ? <><span className="spinner" /> Creating…</> : isVideo ? '🎬 Create video' : '✨ Create designs'}</button>
        </div>
        {picture && !isVideo && <p className="hint">AI pictures come from the free Pollinations service. Your description is sent to it, so don't include personal details.</p>}
      </form>

      {out && (
        <div className="stack" style={{ '--gap': '12px' }}>
          <div className="row small muted" style={{ gap: 8 }}>
            <span>Creator understood:</span>
            <span className="chip">{PRESETS[out.preset].label}</span>
            <span className="chip">{OCCASION_LABEL[out.understood.occasion]}</span>
            {out.understood.moods.slice(0, 2).map((m) => <span key={m} className="chip">{m}</span>)}
            {out.understood.colors.map((c) => <span key={c} className="chip">{c}</span>)}
            {out.understood.offer && <span className="chip">{out.understood.offer}</span>}
            {out.understood.when && <span className="chip">{out.understood.when}</span>}
          </div>
          {picError && <div className="alert alert-info small">🖼️ {picError} Your designs below were still created.</div>}
          <div className="template-grid creator-grid">
            {out.results.map((r, i) => (
              <div key={i} className="template-card" style={{ cursor: 'default' }}>
                <DocPreview doc={r.doc} width={240} />
                <b className="small">{r.name}</b>
                <div className="row" style={{ gap: 6 }}>
                  <button className="btn btn-sm btn-primary" onClick={() => onEdit(r.doc, r.name)}>✏️ Edit</button>
                  <button className="btn btn-sm" onClick={() => download(r)}>⬇️ PNG</button>
                  {canvaConnected && <SendToCanvaButton doc={r.doc} name={r.name} toast={toast} />}
                </div>
              </div>
            ))}
          </div>
          <button className="btn btn-ghost btn-sm" style={{ width: 'fit-content' }} onClick={create}>🔄 More options</button>
        </div>
      )}
    </div>
  );
}
