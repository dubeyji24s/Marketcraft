import { useRef, useState } from 'react';
import { useApi } from '../lib/useApi.js';
import { api } from '../lib/api.js';
import { ErrorBox, CHANNEL_INFO, ConfirmButton } from '../components/common.jsx';
import { VideoPlayer } from './Interviews.jsx';
import { useUI } from '../store/ui.js';
import { useAuth } from '../store/auth.js';

const STATUS = {
  pending: { label: '⏳ Waiting for review', cls: '' },
  approved: { label: '✅ Live in the community', cls: 'chip-success' },
  rejected: { label: '✋ Not approved', cls: 'chip-danger' },
};

function UploadForm({ onPosted }) {
  const [mode, setMode] = useState('upload');
  const [file, setFile] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', channel: 'social', tags: '', visibility: 'private', videoUrl: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);
  const celebrate = useUI((s) => s.celebrate);
  const refresh = useAuth((s) => s.refresh);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const fd = new FormData();
    for (const k of ['title', 'description', 'channel', 'tags', 'visibility']) fd.set(k, form[k]);
    if (mode === 'upload' && file) fd.set('video', file);
    else fd.set('videoUrl', form.videoUrl);
    try {
      const r = await api.post('/showcase', fd);
      celebrate({ badges: r.newBadges, xp: 20, title: r.newBadges.length ? 'You\'re on stage! 🎥' : undefined });
      refresh();
      setForm({ title: '', description: '', channel: 'social', tags: '', visibility: 'private', videoUrl: '' });
      setFile(null);
      onPosted(r.item);
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  }

  const hasVideo = mode === 'upload' ? !!file : /^https:\/\/.+/.test(form.videoUrl);

  return (
    <form className="card card-accent" onSubmit={submit}>
      <h2>📤 Add your marketing video</h2>
      <p className="muted small">Share any marketing video you made: a product reel, an ad, a demo, a pitch. Keep it private as your portfolio, or share it with the Marketcraft community.</p>
      <ErrorBox error={error} />
      <div className="tabs" role="tablist" style={{ marginBottom: 14 }}>
        <button type="button" role="tab" className="tab" aria-selected={mode === 'upload'} onClick={() => setMode('upload')}>Upload video</button>
        <button type="button" role="tab" className="tab" aria-selected={mode === 'link'} onClick={() => setMode('link')}>Paste a link</button>
      </div>
      {mode === 'upload' ? (
        <div className="field">
          <div className="dropzone" role="button" tabIndex={0} onClick={() => inputRef.current?.click()} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && inputRef.current?.click()}>
            <div style={{ fontSize: '2rem' }} aria-hidden>🎬</div>
            <b>{file ? file.name : 'Click to choose your video'}</b>
            <div className="hint">MP4, WebM or MOV · up to 200 MB</div>
          </div>
          <input ref={inputRef} type="file" accept="video/mp4,video/webm,video/quicktime" hidden onChange={(e) => setFile(e.target.files[0] || null)} />
        </div>
      ) : (
        <div className="field">
          <label htmlFor="sc-url">Video link</label>
          <input id="sc-url" type="url" placeholder="https://youtube.com/… or https://vimeo.com/…" value={form.videoUrl} onChange={set('videoUrl')} />
        </div>
      )}
      <div className="field"><label htmlFor="sc-title">Title</label><input id="sc-title" type="text" maxLength={100} value={form.title} onChange={set('title')} placeholder="e.g. 30-second reel for my bracelet shop" /></div>
      <div className="field"><label htmlFor="sc-desc">What's the strategy? <span className="muted">(optional)</span></label><textarea id="sc-desc" style={{ minHeight: 80 }} maxLength={1500} value={form.description} onChange={set('description')} placeholder="Who it's for, where you posted it, what happened" /></div>
      <div className="row" style={{ alignItems: 'flex-start' }}>
        <div className="field" style={{ flex: '1 1 200px' }}>
          <label htmlFor="sc-ch">Channel</label>
          <select id="sc-ch" value={form.channel} onChange={set('channel')}>
            {Object.entries(CHANNEL_INFO).map(([k, c]) => <option key={k} value={k}>{c.emoji} {c.label}</option>)}
          </select>
        </div>
        <div className="field" style={{ flex: '1 1 200px' }}>
          <label htmlFor="sc-tags">Tags <span className="muted">(optional)</span></label>
          <input id="sc-tags" type="text" value={form.tags} onChange={set('tags')} placeholder="bakery, reel, local" />
        </div>
      </div>
      <fieldset className="field" style={{ border: 0, padding: 0 }}>
        <legend style={{ fontWeight: 600, marginBottom: 8 }}>Who can see it?</legend>
        <div className="segmented" role="radiogroup">
          <button type="button" role="radio" aria-checked={form.visibility === 'private'} className="choice" onClick={() => setForm({ ...form, visibility: 'private' })}>
            <span className="emoji" aria-hidden>🔒</span><b>Only me</b><span className="muted small" style={{ display: 'block' }}>My private portfolio</span>
          </button>
          <button type="button" role="radio" aria-checked={form.visibility === 'community'} className="choice" onClick={() => setForm({ ...form, visibility: 'community' })}>
            <span className="emoji" aria-hidden>🌍</span><b>Community</b><span className="muted small" style={{ display: 'block' }}>Shown after an admin approves it</span>
          </button>
        </div>
      </fieldset>
      <button className="btn btn-primary" disabled={busy || !hasVideo || form.title.trim().length < 3}>{busy ? <span className="spinner" /> : 'Add video'}</button>
    </form>
  );
}

function VideoCard({ item, onChange, onDelete }) {
  const toast = useUI((s) => s.toast);
  async function cheer() {
    try {
      const r = await api.post(`/showcase/${item.id}/cheer`);
      onChange(r.item);
    } catch (e) {
      toast(e.message, 'error');
    }
  }
  async function setVisibility(visibility) {
    const r = await api.patch(`/showcase/${item.id}`, { visibility });
    onChange(r.item);
    if (visibility === 'community' && r.item.status === 'pending') toast('Sent for review. It goes live once an admin approves it.', 'success');
  }
  return (
    <article className="card">
      {(item.videoSrc || item.embedUrl) ? (
        <VideoPlayer videoSrc={item.videoSrc} embedUrl={item.embedUrl} title={item.title} />
      ) : (
        <a className="thumb" href={item.videoUrl} target="_blank" rel="noopener noreferrer" aria-label={`Open ${item.title}`}><span className="play">▶</span></a>
      )}
      <div className="row spread" style={{ marginTop: 12 }}>
        <h3 style={{ margin: 0 }}>{item.title}</h3>
        <button className={`btn btn-sm ${item.cheeredByMe ? 'btn-primary' : ''}`} onClick={cheer} aria-pressed={item.cheeredByMe} aria-label="Cheer this video">👏 {item.cheers}</button>
      </div>
      <p className="muted small" style={{ margin: '4px 0 8px' }}>{item.ownerName}{item.ownerRole ? ` · ${item.ownerRole}` : ''} · {CHANNEL_INFO[item.channel]?.emoji} {CHANNEL_INFO[item.channel]?.label}</p>
      {item.description && <p className="small" style={{ whiteSpace: 'pre-wrap' }}>{item.description}</p>}
      {item.tags?.length > 0 && <div className="row" style={{ gap: 6 }}>{item.tags.map((t) => <span key={t} className="chip">#{t}</span>)}</div>}
      {item.mine && (
        <div className="row spread small" style={{ marginTop: 12, paddingTop: 12, borderTop: '1px dashed var(--border)' }}>
          <span className={`chip ${item.visibility === 'private' ? '' : STATUS[item.status]?.cls}`}>{item.visibility === 'private' ? '🔒 Only you' : STATUS[item.status]?.label}</span>
          <span className="row">
            {item.visibility === 'private' ? (
              <button className="btn btn-sm" onClick={() => setVisibility('community')}>Share with community</button>
            ) : (
              <button className="btn btn-sm" onClick={() => setVisibility('private')}>Make private</button>
            )}
            <ConfirmButton onConfirm={() => onDelete(item)} />
          </span>
          {item.status === 'rejected' && item.reviewNote && <p className="small" style={{ width: '100%', margin: '6px 0 0' }}>Admin note: {item.reviewNote}</p>}
        </div>
      )}
    </article>
  );
}

export default function Showcase() {
  const [tab, setTab] = useState('community');
  const { data, error, loading, setData, reload } = useApi(`/showcase${tab === 'mine' ? '?scope=mine' : ''}`);
  const items = data?.items ?? [];

  const replace = (it) => setData((d) => ({ items: d.items.map((x) => (x.id === it.id ? it : x)) }));
  async function remove(it) {
    await api.del(`/showcase/${it.id}`);
    setData((d) => ({ items: d.items.filter((x) => x.id !== it.id) }));
  }

  return (
    <div className="stack" style={{ '--gap': '22px' }}>
      <header>
        <h1>🎥 Marketing Video Showcase</h1>
        <p className="muted" style={{ margin: 0 }}>Post the marketing videos you make, build your portfolio, and get inspired by other learners.</p>
      </header>
      <div className="two-col">
        <div className="stack" style={{ '--gap': '18px' }}>
          <div className="tabs" role="tablist">
            <button role="tab" className="tab" aria-selected={tab === 'community'} onClick={() => setTab('community')}>🌍 Community</button>
            <button role="tab" className="tab" aria-selected={tab === 'mine'} onClick={() => setTab('mine')}>📁 My videos</button>
          </div>
          <ErrorBox error={error} />
          {loading ? (
            <div className="skeleton" />
          ) : items.length === 0 ? (
            <div className="card muted" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.4rem' }} aria-hidden>{tab === 'mine' ? '📁' : '🌱'}</div>
              {tab === 'mine' ? 'You haven\'t added any videos yet. Add your first one!' : 'No community videos yet. Be the first to share one!'}
            </div>
          ) : (
            <div className="stack stagger" style={{ '--gap': '18px' }}>
              {items.map((it) => <VideoCard key={it.id} item={it} onChange={replace} onDelete={remove} />)}
            </div>
          )}
        </div>
        <aside className="stack" style={{ '--gap': '18px' }}>
          <UploadForm onPosted={() => (tab === 'mine' ? reload() : setTab('mine'))} />
          <div className="card small">
            <h3>📏 Community guidelines</h3>
            <ul style={{ paddingLeft: '1.2em', lineHeight: 1.7, margin: 0 }}>
              <li>Only post videos you made or have permission to share.</li>
              <li>Disclose sponsorships or ambassador links (#ad).</li>
              <li>No personal info such as addresses, school names or phone numbers.</li>
              <li>Kids: a parent posts and approves every video.</li>
              <li>Be kind. Cheer others on 👏</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

/** Admin review queue for community videos. */
export function ShowcaseReview() {
  const { data, error, reload } = useApi('/showcase/review/queue');
  const toast = useUI((s) => s.toast);
  const [notes, setNotes] = useState({});
  async function review(id, status) {
    const note = status === 'rejected' ? notes[id] ?? '' : '';
    await api.post(`/showcase/${id}/review`, { status, note });
    toast(status === 'approved' ? 'Approved and now live.' : 'Rejected.', 'success');
    reload();
  }
  if (error) return <ErrorBox error={error} />;
  const items = data?.items ?? [];
  return (
    <div className="card">
      <h2>Showcase review ({items.length})</h2>
      <p className="muted small">Community videos appear for other learners only after you approve them. Check for personal information, honesty and disclosure.</p>
      {items.length === 0 ? <p className="muted">Nothing waiting for review. 🎉</p> : (
        <div className="grid" style={{ '--min': '300px' }}>
          {items.map((it) => (
            <div key={it.id} className="out-card">
              {(it.videoSrc || it.embedUrl) ? <VideoPlayer videoSrc={it.videoSrc} embedUrl={it.embedUrl} title={it.title} /> : <a href={it.videoUrl} target="_blank" rel="noopener noreferrer">Open video link ↗</a>}
              <h3 style={{ marginTop: 10 }}>{it.title}</h3>
              <p className="muted small">{it.ownerName} · {it.ownerRole}</p>
              {it.description && <p className="small">{it.description}</p>}
              <input type="text" aria-label="Note for the learner if rejected" placeholder="Note for the learner if you reject it (optional)" value={notes[it.id] ?? ''} onChange={(e) => setNotes({ ...notes, [it.id]: e.target.value })} style={{ marginBottom: 8 }} />
              <div className="row">
                <button className="btn btn-sm btn-primary" onClick={() => review(it.id, 'approved')}>Approve</button>
                <button className="btn btn-sm btn-danger" onClick={() => review(it.id, 'rejected')}>Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
