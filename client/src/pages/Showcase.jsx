import { useEffect, useRef, useState } from 'react';
import { useApi } from '../lib/useApi.js';
import { api } from '../lib/api.js';
import { ErrorBox, CHANNEL_INFO, ConfirmButton } from '../components/common.jsx';
import { VideoPlayer } from './Interviews.jsx';
import { useUI } from '../store/ui.js';
import { useAuth } from '../store/auth.js';
import { announcePlay } from '../lib/play.js';
import { Icon, IconTile } from '../components/Icon.jsx';

const STATUS = {
  pending: { label: 'Waiting for review', cls: '' },
  approved: { label: 'Live in the community', cls: 'chip-success' },
  rejected: { label: 'Not approved', cls: 'chip-danger' },
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
      <h2 className="title-with-icon"><IconTile name="share" tone="pink" size={38} /> Add your marketing video</h2>
      <p className="muted small">Share any marketing video you made: a product reel, an ad, a demo, a pitch. Keep it private as your portfolio, or share it with the Marketcraft community.</p>
      <ErrorBox error={error} />
      <div className="tabs" role="tablist" style={{ marginBottom: 14 }}>
        <button type="button" role="tab" className="tab" aria-selected={mode === 'upload'} onClick={() => setMode('upload')}>Upload video</button>
        <button type="button" role="tab" className="tab" aria-selected={mode === 'link'} onClick={() => setMode('link')}>Paste a link</button>
      </div>
      {mode === 'upload' ? (
        <div className="field">
          <div className="dropzone" role="button" tabIndex={0} onClick={() => inputRef.current?.click()} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && inputRef.current?.click()}>
            <IconTile name="studio" tone="orange" size={48} style={{ margin: '0 auto 8px' }} />
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
            <IconTile name="lock" tone="violet" size={36} style={{ marginBottom: 6 }} /><b>Only me</b><span className="muted small" style={{ display: 'block' }}>My private portfolio</span>
          </button>
          <button type="button" role="radio" aria-checked={form.visibility === 'community'} className="choice" onClick={() => setForm({ ...form, visibility: 'community' })}>
            <IconTile name="users" tone="teal" size={36} style={{ marginBottom: 6 }} /><b>Community</b><span className="muted small" style={{ display: 'block' }}>Shown after an admin approves it</span>
          </button>
        </div>
      </fieldset>
      <button className="btn btn-primary" disabled={busy || !hasVideo || form.title.trim().length < 3}>{busy ? <span className="spinner" /> : 'Add video'}</button>
    </form>
  );
}

/** Counts a view once the video has been on screen for 3 seconds (unique per viewer on the server). */
function useViewCounter(item, ref, onViews) {
  useEffect(() => {
    const el = ref.current;
    if (!el || item.mine || item.status !== 'approved' || item.visibility !== 'community') return undefined;
    let timer = null;
    let sent = false;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !sent) {
        timer = setTimeout(async () => {
          sent = true;
          io.disconnect();
          try { onViews((await api.post(`/showcase/${item.id}/view`)).views); } catch { /* ignore */ }
        }, 3000);
      } else clearTimeout(timer);
    }, { threshold: 0.5 });
    io.observe(el);
    return () => { clearTimeout(timer); io.disconnect(); };
  }, [item.id]); // eslint-disable-line react-hooks/exhaustive-deps
}

function VideoCard({ item, onChange, onDelete }) {
  const toast = useUI((s) => s.toast);
  const ref = useRef(null);
  useViewCounter(item, ref, (views) => onChange({ ...item, views }));
  async function cheer() {
    try {
      const r = await api.post(`/showcase/${item.id}/cheer`);
      announcePlay(r.play);
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
    <article className="card" ref={ref}>
      {(item.videoSrc || item.embedUrl) ? (
        <VideoPlayer videoSrc={item.videoSrc} embedUrl={item.embedUrl} title={item.title} />
      ) : (
        <a className="thumb" href={item.videoUrl} target="_blank" rel="noopener noreferrer" aria-label={`Open ${item.title}`}><span className="play">▶</span></a>
      )}
      <div className="row spread" style={{ marginTop: 12 }}>
        <h3 style={{ margin: 0 }}>{item.title}</h3>
        <button className={`btn btn-sm ${item.cheeredByMe ? 'btn-primary' : ''}`} onClick={cheer} aria-pressed={item.cheeredByMe} aria-label="Cheer this video"><Icon name="heart" size={16} /> {item.cheers}</button>
      </div>
      <p className="muted small" style={{ margin: '4px 0 8px' }}>{item.ownerName}{item.ownerRole ? ` · ${item.ownerRole}` : ''} · {CHANNEL_INFO[item.channel]?.emoji} {CHANNEL_INFO[item.channel]?.label} · {item.views ?? 0} view{item.views === 1 ? '' : 's'}</p>
      {item.description && <p className="small" style={{ whiteSpace: 'pre-wrap' }}>{item.description}</p>}
      {item.tags?.length > 0 && <div className="row" style={{ gap: 6 }}>{item.tags.map((t) => <span key={t} className="chip">#{t}</span>)}</div>}
      {item.mine && (
        <div className="row spread small" style={{ marginTop: 12, paddingTop: 12, borderTop: '1px dashed var(--border)' }}>
          <span className={`chip ${item.visibility === 'private' ? '' : STATUS[item.status]?.cls}`}>{item.visibility === 'private' ? 'Only you' : STATUS[item.status]?.label}</span>
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
  const kid = useAuth((s) => s.user?.role === 'kid');
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
        <h1 className="title-with-icon"><IconTile name="showcase" tone="red" size={44} /> Marketing Video Showcase</h1>
        <p className="muted" style={{ margin: 0 }}>Post the marketing videos you make, build your portfolio, and get inspired by other learners.</p>
      </header>
      <div className="two-col">
        <div className="stack" style={{ '--gap': '18px' }}>
          <div className="tabs" role="tablist">
            <button role="tab" className="tab" aria-selected={tab === 'community'} onClick={() => setTab('community')}><Icon name="users" size={16} /> Community</button>
            <button role="tab" className="tab" aria-selected={tab === 'mine'} onClick={() => setTab('mine')}><Icon name="image" size={16} /> My videos</button>
          </div>
          <ErrorBox error={error} />
          {loading ? (
            <div className="skeleton" />
          ) : items.length === 0 ? (
            <div className="card muted" style={{ textAlign: 'center' }}>
              <IconTile name={tab === 'mine' ? 'image' : 'leaf'} tone={tab === 'mine' ? 'violet' : 'green'} size={52} style={{ margin: '0 auto 10px' }} />
              {tab === 'mine' ? 'You haven\'t added any videos yet. Add your first one!' : 'No community videos yet. Be the first to share one!'}
            </div>
          ) : (
            <div className="stack stagger" style={{ '--gap': '18px' }}>
              {items.map((it) => <VideoCard key={it.id} item={it} onChange={replace} onDelete={remove} />)}
            </div>
          )}
        </div>
        <aside className="stack" style={{ '--gap': '18px' }}>
          {kid && <MedalPanel />}
          <UploadForm onPosted={() => (tab === 'mine' ? reload() : setTab('mine'))} />
          <div className="card small">
            <h3 className="title-with-icon"><IconTile name="checklist" tone="teal" size={30} /> Community guidelines</h3>
            <ul style={{ paddingLeft: '1.2em', lineHeight: 1.7, margin: 0 }}>
              <li>Only post videos you made or have permission to share.</li>
              <li>Disclose sponsorships or ambassador links (#ad).</li>
              <li>No personal info such as addresses, school names or phone numbers.</li>
              <li>Kids: a parent posts and approves every video.</li>
              <li>Be kind. Cheer others on.</li>
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

// ---- junior medal --------------------------------------------------------------------------
function MedalPanel() {
  const { data, reload } = useApi('/showcase/medal/status');
  const [claiming, setClaiming] = useState(false);
  if (!data) return null;
  const { threshold, videos, claim } = data;
  const best = videos[0];
  const pct = best ? Math.min(100, Math.round((best.views / threshold) * 100)) : 0;
  const statusText = {
    requested: 'Request received! A Marketcraft admin is checking it.',
    approved: 'Approved! Your medal is being prepared.',
    shipped: 'Your medal is on its way! (We deleted your address after posting it.)',
    declined: 'This request wasn\'t approved.',
  };
  return (
    <div className="card medal-card">
      <div className="medal-head">
        <IconTile name="medal" tone="amber" size={52} className="medal-icon" />
        <div>
          <h3 style={{ margin: 0 }}>Win a real medal!</h3>
          <p className="small" style={{ margin: '2px 0 0' }}>When one of your marketing videos reaches <b>{threshold.toLocaleString()} views</b>, we'll post you a free Marketcraft Medal.</p>
        </div>
      </div>
      {claim && claim.status !== 'declined' ? (
        <p className="small" style={{ marginBottom: 0 }}><b>{statusText[claim.status]}</b>{claim.note ? ` Note: ${claim.note}` : ''}</p>
      ) : (
        <>
          {claim?.status === 'declined' && <p className="small">{statusText.declined}{claim.note ? ` Note: ${claim.note}` : ''} You can try again.</p>}
          {best ? (
            <>
              <div className="row spread small" style={{ fontWeight: 700 }}><span className="clamp-1">{best.title}</span><span>{best.views.toLocaleString()} / {threshold.toLocaleString()}</span></div>
              <div className="progress medal-progress"><span style={{ width: `${pct}%` }} /></div>
              <p className="small muted" style={{ margin: '6px 0 0' }}>Views count once per Marketcraft member. Got 1,000 views somewhere else (like YouTube)? A parent can ask us to check.</p>
            </>
          ) : (
            <p className="small muted">Share a video with the community (an admin approves it first) to start counting views.</p>
          )}
          {videos.length > 0 && (claiming
            ? <MedalClaimForm videos={videos} threshold={threshold} onDone={() => { setClaiming(false); reload(); }} onCancel={() => setClaiming(false)} />
            : <button type="button" className="btn btn-sm" style={{ marginTop: 10 }} onClick={() => setClaiming(true)}>{best && best.views >= threshold ? 'Claim my medal' : 'Parent: claim with views from another site'}</button>)}
        </>
      )}
    </div>
  );
}

function MedalClaimForm({ videos, threshold, onDone, onCancel }) {
  const eligible = videos.filter((v) => v.views >= threshold);
  const [f, setF] = useState({ showcaseId: (eligible[0] ?? videos[0]).id, source: eligible.length ? 'marketcraft' : 'external', externalUrl: '', externalViews: '', parentConfirm: false, recipientName: '', line1: '', line2: '', city: '', region: '', postalCode: '', country: '' });
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const { recipientName, line1, line2, city, region, postalCode, country, externalViews, ...rest } = f;
      await api.post('/showcase/medal/claim', { ...rest, ...(f.source === 'external' ? { externalViews: Number(externalViews) } : { externalUrl: '' }), shipping: { recipientName, line1, line2, city, region, postalCode, country } });
      useUI.getState().toast('Medal request sent!', 'success');
      onDone();
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  }
  return (
    <form className="stack medal-form" style={{ '--gap': '10px', marginTop: 12 }} onSubmit={submit}>
      <p className="small" style={{ margin: 0 }}><b>For a parent or guardian to fill in.</b> We use this address only to post the medal, show it only to the Marketcraft admin, and delete it as soon as the medal is sent.</p>
      <ErrorBox error={error} />
      <label className="field"><span>Video</span>
        <select value={f.showcaseId} onChange={set('showcaseId')}>{videos.map((v) => <option key={v.id} value={v.id}>{v.title} ({v.views} views here)</option>)}</select></label>
      <div className="segmented" role="radiogroup" aria-label="Where did it get its views?">
        <button type="button" role="radio" aria-checked={f.source === 'marketcraft'} className="choice" onClick={() => setF({ ...f, source: 'marketcraft' })}><b>On Marketcraft</b></button>
        <button type="button" role="radio" aria-checked={f.source === 'external'} className="choice" onClick={() => setF({ ...f, source: 'external' })}><b>On another site</b></button>
      </div>
      {f.source === 'external' && (
        <div className="row" style={{ alignItems: 'flex-start' }}>
          <label className="field" style={{ flex: '2 1 200px' }}><span>Link to the video</span><input type="url" required placeholder="https://…" value={f.externalUrl} onChange={set('externalUrl')} /></label>
          <label className="field" style={{ flex: '1 1 120px' }}><span>Views</span><input type="number" min={threshold} required value={f.externalViews} onChange={set('externalViews')} /></label>
        </div>
      )}
      <label className="field"><span>Parent or guardian's name</span><input required maxLength={80} autoComplete="name" value={f.recipientName} onChange={set('recipientName')} /></label>
      <label className="field"><span>Street address</span><input required maxLength={120} autoComplete="address-line1" value={f.line1} onChange={set('line1')} /></label>
      <label className="field"><span>Apartment, unit (optional)</span><input maxLength={120} autoComplete="address-line2" value={f.line2} onChange={set('line2')} /></label>
      <div className="row" style={{ alignItems: 'flex-start' }}>
        <label className="field" style={{ flex: '1 1 140px' }}><span>City / town</span><input required maxLength={60} autoComplete="address-level2" value={f.city} onChange={set('city')} /></label>
        <label className="field" style={{ flex: '1 1 140px' }}><span>State / region</span><input maxLength={60} autoComplete="address-level1" value={f.region} onChange={set('region')} /></label>
      </div>
      <div className="row" style={{ alignItems: 'flex-start' }}>
        <label className="field" style={{ flex: '1 1 120px' }}><span>Postal / ZIP code</span><input required maxLength={20} autoComplete="postal-code" value={f.postalCode} onChange={set('postalCode')} /></label>
        <label className="field" style={{ flex: '1 1 140px' }}><span>Country</span><input required maxLength={60} autoComplete="country-name" value={f.country} onChange={set('country')} /></label>
      </div>
      <label className="checkbox"><input type="checkbox" checked={f.parentConfirm} onChange={set('parentConfirm')} /> <span>I'm this child's parent or guardian, and I agree to share this address only so Marketcraft can post the medal.</span></label>
      <div className="row">
        <button className="btn btn-primary btn-sm" disabled={busy || !f.parentConfirm}>{busy ? <span className="spinner" /> : 'Send request'}</button>
        <button type="button" className="btn btn-sm btn-ghost" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}

/** Admin: medal requests (addresses are deleted automatically once marked shipped or declined). */
export function MedalClaims() {
  const { data, error, reload } = useApi('/showcase/medal/claims');
  const toast = useUI((s) => s.toast);
  const [notes, setNotes] = useState({});
  async function act(id, status) {
    try {
      await api.post(`/showcase/medal/claims/${id}`, { status, note: notes[id] ?? '' });
      toast(status === 'shipped' ? 'Marked as shipped. The address has been deleted.' : `Marked ${status}.`, 'success');
      reload();
    } catch (e) {
      toast(e.message, 'error');
    }
  }
  if (error) return <ErrorBox error={error} />;
  const claims = data?.claims ?? [];
  return (
    <div className="card">
      <h2 className="title-with-icon"><IconTile name="medal" tone="amber" size={38} /> Medal requests ({claims.filter((c) => c.status === 'requested' || c.status === 'approved').length} open)</h2>
      <p className="muted small">Juniors whose video reached {data?.threshold?.toLocaleString() ?? '1,000'} views. Check the video (and for other sites, the view count at the link), then approve, post the medal, and mark it shipped. Marking shipped or declined deletes the home address.</p>
      {claims.length === 0 ? <p className="muted">No medal requests yet.</p> : (
        <div className="grid" style={{ '--min': '300px' }}>
          {claims.map((c) => (
            <div key={c.id} className="out-card small">
              <div className="row spread"><b>{c.learner}</b><span className="chip">{c.status}</span></div>
              <p style={{ margin: '6px 0' }}>Video: {c.showcaseTitle ?? '(deleted)'} · {Number(c.views).toLocaleString()} views {c.source === 'external' ? <>on <a href={c.externalUrl} target="_blank" rel="noopener noreferrer">another site ↗</a> (check it)</> : 'on Marketcraft'}</p>
              {c.shipTo ? (
                <address style={{ fontStyle: 'normal', whiteSpace: 'pre-line', background: 'var(--surface)', padding: 8, borderRadius: 8 }}>
                  {[c.shipTo.recipientName, c.shipTo.line1, c.shipTo.line2, [c.shipTo.city, c.shipTo.region, c.shipTo.postalCode].filter(Boolean).join(', '), c.shipTo.country].filter(Boolean).join('\n')}
                </address>
              ) : <p className="muted">Address deleted{c.shippedAt ? ` (shipped ${new Date(c.shippedAt).toLocaleDateString()})` : ''}.</p>}
              {c.contactEmail && <p className="muted" style={{ margin: '6px 0' }}>Parent account: {c.contactEmail}</p>}
              {(c.status === 'requested' || c.status === 'approved') && (
                <>
                  <input type="text" aria-label="Note" placeholder="Note for the family (optional)" value={notes[c.id] ?? ''} onChange={(e) => setNotes({ ...notes, [c.id]: e.target.value })} style={{ margin: '6px 0' }} />
                  <div className="row">
                    {c.status === 'requested' && <button className="btn btn-sm btn-primary" onClick={() => act(c.id, 'approved')}>Approve</button>}
                    <button className="btn btn-sm" onClick={() => act(c.id, 'shipped')}>Mark shipped</button>
                    <button className="btn btn-sm btn-danger" onClick={() => act(c.id, 'declined')}>Decline</button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
