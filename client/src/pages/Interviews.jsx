/* global __PREVIEW__ */
import { useMemo, useState } from 'react';
import { useApi } from '../lib/useApi.js';
import { ErrorBox, Modal } from '../components/common.jsx';

export function VideoPlayer({ videoSrc, embedUrl, title }) {
  if (videoSrc) {
    return (
      <div className="video-frame">
        <video src={videoSrc} controls preload="metadata" playsInline aria-label={title} />
      </div>
    );
  }
  if (embedUrl && __PREVIEW__) {
    return (
      <a className="video-frame" style={{ display: 'grid', placeItems: 'center', textDecoration: 'none' }} href={embedUrl.replace('youtube-nocookie.com/embed/', 'youtube.com/watch?v=')} target="_blank" rel="noopener noreferrer">
        <span className="btn">▶ Watch on YouTube ↗</span>
      </a>
    );
  }
  if (embedUrl) {
    return (
      <div className="video-frame">
        <iframe src={embedUrl} title={title} allow="accelerometer; encrypted-media; picture-in-picture; fullscreen" allowFullScreen loading="lazy" referrerPolicy="strict-origin-when-cross-origin" />
      </div>
    );
  }
  return (
    <div className="video-frame" style={{ display: 'grid', placeItems: 'center' }}>
      <span className="muted">🎥 Video coming soon</span>
    </div>
  );
}

const EMOJIS = ['☕', '🥐', '🧁', '💐', '🧵', '🚲', '🎨', '🍕'];

export default function Interviews() {
  const { data, error, loading } = useApi('/interviews');
  const [open, setOpen] = useState(null);
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState('takeaways');

  const list = useMemo(() => {
    const q = query.toLowerCase();
    return (data?.interviews ?? []).filter((i) => !q || [i.title, i.businessName, ...(i.tags || [])].join(' ').toLowerCase().includes(q));
  }, [data, query]);

  return (
    <div className="stack" style={{ '--gap': '22px' }}>
      <header className="row spread">
        <div>
          <h1>Business Owner Interviews</h1>
          <p className="muted" style={{ margin: 0 }}>Real local owners share practical, low-cost growth advice.</p>
        </div>
        <input type="text" placeholder="Search interviews or tags…" aria-label="Search interviews" value={query} onChange={(e) => setQuery(e.target.value)} style={{ maxWidth: 300 }} />
      </header>
      <ErrorBox error={error} />
      {loading ? (
        <div className="grid"><div className="skeleton" /><div className="skeleton" /></div>
      ) : (
        <div className="grid stagger" style={{ '--min': '300px' }}>
          {list.map((i, idx) => (
            <button key={i.id} className="card interactive" style={{ textAlign: 'left', font: 'inherit', color: 'inherit' }} onClick={() => { setOpen(i); setTab('takeaways'); }}>
              <div className="thumb" aria-hidden>
                <span style={{ position: 'absolute', top: 10, left: 14 }}>{EMOJIS[idx % EMOJIS.length]}</span>
                <span className="play">▶</span>
              </div>
              <h3>{i.title}</h3>
              <p className="muted small" style={{ margin: '0 0 10px' }}>{[i.ownerName, i.businessName].filter(Boolean).join(' · ')}</p>
              <ul className="small" style={{ paddingLeft: '1.1em', margin: '0 0 10px' }}>
                {i.takeaways.slice(0, 2).map((t, k) => <li key={k}>{t}</li>)}
              </ul>
              <div className="row">{(i.tags || []).map((t) => <span key={t} className="chip">#{t}</span>)}</div>
            </button>
          ))}
          {list.length === 0 && <p className="muted">No interviews match.</p>}
        </div>
      )}

      {open && (
        <Modal wide onClose={() => setOpen(null)} label={open.title}>
          <div className="row spread" style={{ marginBottom: 12 }}>
            <h2 style={{ margin: 0 }}>{open.title}</h2>
            <button className="btn btn-ghost btn-sm" onClick={() => setOpen(null)} aria-label="Close">✕</button>
          </div>
          <VideoPlayer videoSrc={open.videoSrc} embedUrl={open.embedUrl} title={open.title} />
          <p className="muted small" style={{ marginTop: 10 }}>{[open.ownerName, open.businessName].filter(Boolean).join(' · ')}</p>
          {open.summary && <p>{open.summary}</p>}
          <div className="tabs" role="tablist" style={{ margin: '8px 0 14px' }}>
            <button role="tab" className="tab" aria-selected={tab === 'takeaways'} onClick={() => setTab('takeaways')}>Key takeaways</button>
            <button role="tab" className="tab" aria-selected={tab === 'transcript'} onClick={() => setTab('transcript')}>Transcript summary</button>
          </div>
          {tab === 'takeaways' ? (
            <ol className="checklist">{open.takeaways.map((t, k) => <li key={k}><span aria-hidden>💡</span>{t}</li>)}</ol>
          ) : (
            <p style={{ whiteSpace: 'pre-wrap' }}>{open.transcriptSummary || 'No transcript summary yet.'}</p>
          )}
        </Modal>
      )}
    </div>
  );
}
