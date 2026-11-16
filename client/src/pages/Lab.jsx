// My Marketing Lab: unlocked by the Ambassador certificate. Graduates market their OWN
// product or service with every tool in one place.
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApi } from '../lib/useApi.js';
import { api } from '../lib/api.js';
import { ErrorBox, Loading, ConfirmButton } from '../components/common.jsx';
import { OutputView } from './Ambassador.jsx';
import DesignEditor, { blankDoc, renderDoc, PRESETS, TemplateGallery } from '../components/DesignEditor.jsx';
import { designChoicesFromRun, scenesFromScript } from '../components/templates.js';
import Creator from '../components/Creator.jsx';
import { CanvaConnectCard, SendToCanvaButton, useCanva } from '../components/CanvaConnect.jsx';
import { useLocation } from 'react-router-dom';
import { checkRelevance, checkRequest, docText, scenesText } from '@guard';
import VideoMaker from '../components/VideoMaker.jsx';
import { downloadBlob, downloadText, outputToText, safeName } from '../lib/download.js';
import { useUI } from '../store/ui.js';
import { useAuth } from '../store/auth.js';

const TABS = [
  ['brand', '🏷️', 'My brand'],
  ['creator', '✨', 'Creator'],
  ['tools', '🧰', 'AI Toolkit'],
  ['design', '🎨', 'Design Studio'],
  ['video', '🎬', 'Video Maker'],
  ['files', '📁', 'My files'],
  ['team', '🤖', 'AI team'],
];

function Locked({ s }) {
  return (
    <div className="stack" style={{ '--gap': '22px' }}>
      <header className="card hero-card">
        <h1>🧪 My Marketing Lab</h1>
        <p className="muted" style={{ margin: 0 }}>Your own marketing studio: AI tools, a design studio and a video maker, all working on <b>your</b> product or service.</p>
      </header>
      <div className="card" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '3rem' }} aria-hidden>🔒</div>
        <h2>Opens when you join the Ambassador Program</h2>
        <p className="muted">Pass a Studio challenge at {s.passThreshold}%+, then join the Ambassador Program. Your Lab opens in <b>Partner mode</b> (everything you make promotes the partner website). Earn the Ambassador certificate to unlock <b>your own brand</b>.</p>
        <div className="row" style={{ justifyContent: 'center' }}>
          <Link className="btn btn-primary" to="/app/ambassador">Go to the Ambassador Program</Link>
          {s.missionId && <Link className="btn" to={`/app/studio/${s.missionId}`}>Ambassador Mission</Link>}
        </div>
      </div>
      <div className="grid stagger" style={{ '--min': '220px' }}>
        {[['🧰', 'All 6 AI tools, one screen', 'Persona, posts, scripts, ads, calendar and checker without switching pages.'], ['🎨', 'Design Studio', 'Make posts, stories, flyers and posters, then download PNG or JPG.'], ['🎬', 'Video Maker', 'Scenes, animated text and free, original music. Export a ready-to-post video.'], ['⬇️', 'Download everything', 'Save every draft, design and video to your device.']].map(([i, t, d]) => (
          <div key={t} className="card"><div style={{ fontSize: '2rem' }} aria-hidden>{i}</div><h3>{t}</h3><p className="muted small" style={{ margin: 0 }}>{d}</p></div>
        ))}
      </div>
    </div>
  );
}

const BRAND_FIELDS = [
  ['name', 'Brand / business name', 'text', 'e.g. Maya\'s Bracelets'],
  ['website', 'Website or shop link', 'url', 'https://… (optional)'],
  ['tagline', 'Tagline', 'text', 'One line that sums it up'],
  ['description', 'What do you sell or do?', 'textarea', 'Describe your product or service in plain words'],
  ['products', 'Products / services & prices', 'textarea', 'One per line'],
  ['audience', 'Who is it for?', 'textarea', 'Your ideal customers'],
  ['keyMessages', 'Why choose you?', 'textarea', 'What makes you different'],
  ['offers', 'Current real offers', 'textarea', 'Only real ones, or leave blank'],
  ['voice', 'Brand voice', 'text', 'e.g. friendly, fun, professional'],
  ['dos', "Do's", 'textarea', ''],
  ['donts', "Don'ts", 'textarea', 'e.g. never promise results'],
  ['hashtags', 'Hashtags', 'text', '#…'],
];

function PartnerCard({ partner, missionId }) {
  return (
    <div className="card card-accent">
      <h2>🤝 You're creating for the {partner.displayName}</h2>
      <p className="muted small">Until you earn your Ambassador certificate, everything you make in the Lab promotes our partner. The 🛡️ Partner Guard checks each request, design and video and helps you keep it on-topic. Creator and the AI tools add the partner's name for you.</p>
      <dl className="kv">
        <dt>Promote</dt><dd><b>{partner.name}</b>{partner.tagline ? ` · ${partner.tagline}` : ''}</dd>
        {partner.description && <><dt>What it does</dt><dd>{partner.description}</dd></>}
        {partner.products && <><dt>Products</dt><dd style={{ whiteSpace: 'pre-wrap' }}>{partner.products}</dd></>}
        {partner.hashtags && <><dt>Hashtags</dt><dd>{partner.hashtags}</dd></>}
        {partner.referralLink && <><dt>Your link</dt><dd><code style={{ wordBreak: 'break-all' }}>{partner.referralLink}</code></dd></>}
      </dl>
      <div className="row" style={{ marginTop: 14 }}>
        {missionId && <Link className="btn btn-primary" to={`/app/studio/${missionId}`}>🌟 Earn the Ambassador certificate</Link>}
        <span className="muted small">…to unlock <b>My brand</b> and market your own product.</span>
      </div>
    </div>
  );
}

function AgentsPanel() {
  const { data, error, reload } = useApi('/lab/agents');
  if (error) return <ErrorBox error={error} />;
  if (!data) return <Loading />;
  const saved = data.agents.reduce((n, a) => n + a.cacheHits, 0);
  return (
    <div className="stack" style={{ '--gap': '16px' }}>
      <div className="card">
        <div className="row spread">
          <h2 style={{ margin: 0 }}>🤖 Your AI team</h2>
          <button className="btn btn-sm btn-ghost" onClick={reload}>Refresh</button>
        </div>
        <p className="muted small">The <b>Director</b> sends each job to the right agent. Rules and saved answers come first, so most jobs cost <b>0 tokens</b>; a small AI model is only asked when the Guard is unsure, and only when AI is switched on.</p>
        <div className="row small" style={{ gap: 8 }}>
          <span className="chip">{data.aiEnabled ? '⚡ AI on' : '⚡ Free Starter mode (0 tokens)'}</span>
          <span className="chip chip-success">♻️ {saved} answers re-used</span>
          {data.aiEnabled && <span className="chip">Today: {data.usedToday?.toLocaleString() ?? 0} / {data.dailyBudget.toLocaleString()} tokens</span>}
        </div>
      </div>
      <div className="grid stagger" style={{ '--min': '240px' }}>
        {data.agents.map((a) => (
          <div key={a.id} className="card agent-card">
            <div className="row" style={{ gap: 10 }}><span className="agent-icon" aria-hidden>{a.icon}</span><h3 style={{ margin: 0 }}>{a.name}</h3></div>
            <p className="muted small">{a.job}</p>
            <div className="row small" style={{ gap: 6 }}>
              <span className="chip">{a.runs} jobs</span>
              {a.cacheHits > 0 && <span className="chip chip-success">{a.cacheHits} re-used</span>}
              {a.blocked > 0 && <span className="chip chip-danger">{a.blocked} stopped</span>}
              <span className="chip">{a.tokens.toLocaleString()} tokens</span>
            </div>
          </div>
        ))}
      </div>
      <p className="hint">Designer and Video Producer run in your browser, so they never use tokens. Counts reset when the server restarts.</p>
    </div>
  );
}

function BrandForm({ brand, onSaved }) {
  const [f, setF] = useState(brand);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const celebrate = useUI((s) => s.celebrate);
  const toast = useUI((s) => s.toast);
  async function save(e) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      const r = await api.put('/lab/brand', f);
      onSaved(r.brand);
      if (r.newBadges?.length) celebrate({ badges: r.newBadges, xp: 30, title: 'Your Lab is open! 🧪' });
      else toast('Brand saved. All tools now use it.', 'success');
    } catch (e2) {
      setErr(e2);
    } finally {
      setBusy(false);
    }
  }
  return (
    <form className="card" onSubmit={save}>
      <h2>🏷️ My brand</h2>
      <p className="muted small">Tell the Lab about your own product or service once. Every AI tool and template uses these facts, so be accurate: the AI never makes up prices, results or reviews.</p>
      <ErrorBox error={err} />
      <div className="grid" style={{ '--min': '280px', gap: '0 18px' }}>
        {BRAND_FIELDS.map(([k, label, type, ph]) => (
          <div className="field" key={k} style={type === 'textarea' ? { gridColumn: '1 / -1' } : undefined}>
            <label htmlFor={`brand-${k}`}>{label}</label>
            {type === 'textarea'
              ? <textarea id={`brand-${k}`} style={{ minHeight: 70 }} placeholder={ph} value={f[k] ?? ''} onChange={(e) => setF({ ...f, [k]: e.target.value })} />
              : <input id={`brand-${k}`} type={type} placeholder={ph} value={f[k] ?? ''} onChange={(e) => setF({ ...f, [k]: e.target.value })} />}
          </div>
        ))}
      </div>
      <button className="btn btn-primary" disabled={busy || !f.name?.trim() || !f.description?.trim()}>{busy ? <span className="spinner" /> : 'Save my brand'}</button>
    </form>
  );
}

/** All six AI tools on one screen. */
/** "Make a design / video" buttons that hand an AI result to the Design Studio or Video Maker. */
function HandoffButtons({ run, brand, onHandoff }) {
  const choices = designChoicesFromRun(run, brand);
  const [pick, setPick] = useState(0);
  if (!choices.length && run.toolId !== 'video-script') return null;
  return (
    <div className="handoff-bar" style={{ marginBottom: 10 }}>
      {choices.length > 1 && (
        <select aria-label="Which result to design" value={pick} onChange={(e) => setPick(+e.target.value)}>
          {choices.map((c, i) => <option key={i} value={i}>{c.label.slice(0, 70)}</option>)}
        </select>
      )}
      {choices.length > 0 && <button className="btn btn-sm btn-primary" onClick={() => onHandoff({ kind: 'design', fields: choices[pick].fields, from: choices[pick].label })}>🎨 Make a design</button>}
      {run.toolId === 'video-script' && <button className="btn btn-sm btn-primary" onClick={() => onHandoff({ kind: 'video', scenes: scenesFromScript(run) })}>🎬 Make a video</button>}
    </div>
  );
}

function Toolkit({ s, brandReady, onRun, onHandoff }) {
  const recent = useApi('/lab/runs');
  const [toolId, setToolId] = useState(s.tools[0].id);
  const [inputs, setInputs] = useState({});
  const [results, setResults] = useState([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const [showGuide, setShowGuide] = useState(true);
  const toast = useUI((x) => x.toast);
  const tool = s.tools.find((t) => t.id === toolId);
  const vals = inputs[toolId] ?? {};
  const missing = tool.fields.filter((f) => f.required && !(vals[f.key] ?? '').toString().trim());

  async function run(e) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      const { run: r } = await api.post(`/lab/tools/${tool.id}`, { inputs: vals });
      setResults((rs) => [r, ...rs]);
      onRun?.();
    } catch (e2) {
      setErr(e2);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="lab-tools">
      <nav className="lab-toolnav" aria-label="AI tools">
        {s.tools.map((t, i) => (
          <button key={t.id} className={`lab-toolbtn ${t.id === toolId ? 'is-active' : ''}`} onClick={() => { setToolId(t.id); setErr(null); }}>
            <span aria-hidden>{t.icon}</span><span><b>{t.name}</b><small>Step {i + 1}</small></span>
          </button>
        ))}
        <p className="hint">Suggested order: Persona → Calendar → Post / Script / Ad → Checker</p>
      </nav>

      <div className="stack" style={{ '--gap': '16px', minWidth: 0 }}>
        {!brandReady && <div className="alert alert-info small">{s.mode === 'partner' ? 'The partner brief is not ready yet. Ask an admin to complete it.' : <>Fill in <b>My brand</b> first so the tools know what to market.</>}</div>}
        {s.mode === 'partner' && <div className="alert alert-info small">🛡️ <b>Partner mode:</b> results promote <b>{s.brand.name}</b>, with your ambassador disclosure and referral link added for you.</div>}
        {!s.aiEnabled && <div className="alert alert-info small">⚡ <b>Free Starter mode:</b> results are written from <b>your brand</b> by Marketcraft's built-in engine, free and instant. Edit them to sound like you.</div>}
        <form className="card" onSubmit={run}>
          <div className="row spread">
            <h2 style={{ margin: 0 }}>{tool.icon} {tool.name}</h2>
            <button type="button" className="btn btn-sm btn-ghost" onClick={() => setShowGuide(!showGuide)}>{showGuide ? 'Hide guide' : 'How to use'}</button>
          </div>
          <p className="muted small" style={{ marginTop: 6 }}>{tool.tagline}</p>
          {showGuide && (
            <div className="out-card small" style={{ marginBottom: 14 }}>
              <p style={{ margin: '0 0 6px' }}><b>What it does:</b> {tool.whatItDoes}</p>
              <p style={{ margin: '0 0 6px' }}><b>When to use it:</b> {tool.whenToUse}</p>
              <ol style={{ paddingLeft: '1.2em', margin: '0 0 6px' }}>{tool.howTo.map((h, i) => <li key={i}>{h}</li>)}</ol>
              <p style={{ margin: 0 }}>💡 {tool.proTip}</p>
            </div>
          )}
          <ErrorBox error={err} />
          {tool.fields.map((f) => {
            const v = vals[f.key] ?? '';
            const set = (val) => setInputs({ ...inputs, [toolId]: { ...vals, [f.key]: val } });
            return (
              <div className="field" key={f.key}>
                <label htmlFor={`lab-${toolId}-${f.key}`}>{f.label}{!f.required && <span className="muted"> (optional)</span>}</label>
                {f.type === 'select' ? (
                  <select id={`lab-${toolId}-${f.key}`} value={v} onChange={(e) => set(e.target.value)}>
                    <option value="" disabled>Choose…</option>
                    {f.options.map((o) => <option key={o}>{o}</option>)}
                  </select>
                ) : f.type === 'textarea' ? (
                  <textarea id={`lab-${toolId}-${f.key}`} maxLength={f.max} placeholder={f.placeholder?.replace('the company', 'your brand')} value={v} onChange={(e) => set(e.target.value)} />
                ) : (
                  <input id={`lab-${toolId}-${f.key}`} type="text" maxLength={f.max} placeholder={f.placeholder} value={v} onChange={(e) => set(e.target.value)} />
                )}
              </div>
            );
          })}
          <button className="btn btn-primary" disabled={busy || missing.length > 0 || !brandReady}>{busy ? <><span className="spinner" /> Working…</> : '✨ Generate'}</button>
        </form>

        {[...results, ...(recent.data?.runs ?? []).filter((r) => !results.some((x) => x.id === r.id))].map((r) => {
          const t = s.tools.find((x) => x.id === r.toolId);
          return (
            <div key={r.id} className="card page-enter">
              <div className="row spread" style={{ marginBottom: 8 }}>
                <b>{t?.icon} {t?.name}</b>
                <span className="row">
                  <button className="btn btn-sm" onClick={() => navigator.clipboard?.writeText(outputToText(r.output)).then(() => toast('Copied!', 'success'), () => {})}>Copy</button>
                  <button className="btn btn-sm btn-primary" onClick={() => downloadText(outputToText(r.output), `${safeName(t?.name)}.txt`)}>⬇️ Download</button>
                </span>
              </div>
              <HandoffButtons run={r} brand={s.brand?.name} onHandoff={onHandoff} />
              <OutputView value={r.output} toast={toast} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DesignStudio({ brand, handoff, clearHandoff, canva, reloadCanva, guardDoc }) {
  const { data, reload } = useApi('/lab/designs');
  const [open, setOpen] = useState(handoff?.kind === 'doc' ? { name: handoff.name, doc: handoff.doc } : null); // { id?, name, doc }
  const [saving, setSaving] = useState(false);
  const toast = useUI((x) => x.toast);
  useEffect(() => { if (handoff?.kind === 'doc') clearHandoff(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const galleryFields = useMemo(() => ({ brand: brand?.name, hashtags: brand?.hashtags }), [brand?.name, brand?.hashtags]);

  async function openDesign(id) {
    const { design } = await api.get(`/lab/designs/${id}`);
    setOpen(design);
  }
  async function save({ name, doc }) {
    setSaving(true);
    try {
      if (open?.id) await api.put(`/lab/designs/${open.id}`, { name, doc });
      else {
        const { design } = await api.post('/lab/designs', { name, doc });
        setOpen({ ...open, id: design.id, name, doc });
      }
      toast('Design saved.', 'success');
      reload();
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      setSaving(false);
    }
  }

  if (open) {
    return (
      <div className="stack" style={{ '--gap': '12px' }}>
        <button className="btn btn-sm btn-ghost" style={{ width: 'fit-content' }} onClick={() => { setOpen(null); reload(); }}>← All designs</button>
        <DesignEditor key={open.id ?? 'new'} initial={open.doc} name={open.name} brand={brand?.name} onSave={save} saving={saving} guardDoc={guardDoc}
          actions={canva?.connected ? ({ doc, name }) => <SendToCanvaButton doc={doc} name={name} toast={toast} /> : undefined} />
      </div>
    );
  }

  return (
    <div className="stack" style={{ '--gap': '18px' }}>
      {handoff?.kind === 'design' && (
        <div className="card card-accent" style={{ '--accent': 'linear-gradient(90deg,#ff3d81,#ffd23f)' }}>
          <div className="row spread">
            <h2 style={{ margin: 0 }}>✨ Pick a template for your AI text</h2>
            <button className="btn btn-sm btn-ghost" onClick={clearHandoff}>Dismiss</button>
          </div>
          <p className="muted small">From: {handoff.from}. Every template below already has your words in it. Pick one, then edit anything.</p>
          <TemplateGallery fields={handoff.fields} onPick={(doc, name) => { setOpen({ name: `${name} · ${brand?.name ?? 'design'}`, doc }); clearHandoff(); }} />
        </div>
      )}
      <div className="card">
        <h2>🎨 Start a new design</h2>
        <p className="muted small">Pick a size. You can add text, shapes and your own photos, or start from a template inside the editor.</p>
        <div className="grid" style={{ '--min': '170px', gap: 10 }}>
          {Object.entries(PRESETS).map(([k, p]) => (
            <button key={k} className="choice" onClick={() => setOpen({ name: `${p.label} design`, doc: blankDoc(k) })}>
              <span className="preset-shape" style={{ aspectRatio: `${p.w} / ${p.h}` }} aria-hidden />
              <b>{p.label}</b>
              <span className="muted small" style={{ display: 'block' }}>{p.w} × {p.h}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="card">
        <h2>🖼️ Free templates</h2>
        <p className="muted small">Original Marketcraft templates, free to use. Your brand name is already filled in.</p>
        <TemplateGallery fields={galleryFields} onPick={(doc, name) => setOpen({ name: `${name} · ${brand?.name ?? 'design'}`, doc })} />
      </div>
      <CanvaConnectCard status={canva} onChange={reloadCanva} />
      <div className="card">
        <h2>My designs</h2>
        {!data?.designs?.length ? <p className="muted">No saved designs yet.</p> : (
          <ul className="checklist">
            {data.designs.map((d) => (
              <li key={d.id} className="row spread">
                <span style={{ flex: 1, minWidth: 160 }}><b>{d.name}</b><br /><span className="muted small">{PRESETS[d.preset]?.label ?? `${d.width}×${d.height}`} · {new Date(d.updatedAt).toLocaleDateString()}</span></span>
                <button className="btn btn-sm" onClick={() => openDesign(d.id)}>Open</button>
                <ConfirmButton onConfirm={async () => { await api.del(`/lab/designs/${d.id}`); reload(); }} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Files({ s }) {
  const runs = useApi('/lab/runs');
  const designs = useApi('/lab/designs');
  const toast = useUI((x) => x.toast);
  const [openRun, setOpenRun] = useState(null);
  const names = Object.fromEntries(s.tools.map((t) => [t.id, t]));

  async function downloadDesign(d) {
    const { design } = await api.get(`/lab/designs/${d.id}`);
    const canvas = await renderDoc(design.doc);
    const blob = await new Promise((r) => canvas.toBlob(r, 'image/png'));
    downloadBlob(blob, `${safeName(d.name)}.png`);
  }
  function downloadAll() {
    const text = (runs.data?.runs ?? []).map((r) => `==== ${names[r.toolId]?.name ?? r.toolId} · ${new Date(r.createdAt).toLocaleString()} ====\n${outputToText(r.output)}`).join('\n\n');
    downloadText(text, 'marketcraft-lab-drafts.txt');
  }

  return (
    <div className="stack" style={{ '--gap': '18px' }}>
      <div className="card">
        <div className="row spread"><h2 style={{ margin: 0 }}>✍️ AI drafts</h2>
          <button className="btn btn-sm btn-primary" disabled={!runs.data?.runs?.length} onClick={downloadAll}>⬇️ Download all</button></div>
        {!runs.data?.runs?.length ? <p className="muted">No AI drafts yet. Use the AI Toolkit tab.</p> : (
          <ul className="checklist">
            {runs.data.runs.map((r) => (
              <li key={r.id} style={{ display: 'block' }}>
                <div className="row spread">
                  <span><b>{names[r.toolId]?.icon} {names[r.toolId]?.name}</b> <span className="muted small">{new Date(r.createdAt).toLocaleString()}</span></span>
                  <span className="row">
                    <button className="btn btn-sm" onClick={() => setOpenRun(openRun === r.id ? null : r.id)}>{openRun === r.id ? 'Hide' : 'Open'}</button>
                    <button className="btn btn-sm" onClick={() => downloadText(outputToText(r.output), `${safeName(names[r.toolId]?.name)}.txt`)}>⬇️ .txt</button>
                    <ConfirmButton onConfirm={async () => { await api.del(`/lab/runs/${r.id}`); runs.reload(); }} />
                  </span>
                </div>
                {openRun === r.id && <div style={{ marginTop: 10 }}><OutputView value={r.output} toast={toast} /></div>}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="card">
        <h2>🎨 Designs</h2>
        {!designs.data?.designs?.length ? <p className="muted">No designs yet. Use the Design Studio tab.</p> : (
          <ul className="checklist">
            {designs.data.designs.map((d) => (
              <li key={d.id} className="row spread">
                <span style={{ flex: 1 }}><b>{d.name}</b> <span className="muted small">{d.width}×{d.height}</span></span>
                <button className="btn btn-sm btn-primary" onClick={() => downloadDesign(d)}>⬇️ PNG</button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="card small muted">🎬 Videos download straight to your device when you export them in the Video Maker. Add your favourites to the <Link to="/app/showcase">Showcase</Link> to keep them online.</div>
    </div>
  );
}

export default function Lab() {
  const { data, error, loading, setData } = useApi('/lab/status');
  const [tab, setTab] = useState(null);
  const [handoff, setHandoff] = useState(null);
  const canva = useCanva();
  const location = useLocation();
  const toast = useUI((x) => x.toast);
  useEffect(() => {
    const c = new URLSearchParams(location.search).get('canva');
    if (c === 'connected') toast('Your Canva is connected! Use "Send to Canva" on any design.', 'success');
    if (c === 'failed') toast('Canva connection did not finish. Please try again.', 'error');
  }, [location.search, toast]);
  const user = useAuth((x) => x.user);

  if (error) return <ErrorBox error={error} />;
  if (loading || !data) return <Loading />;
  if (!data.unlocked) return <Locked s={data} />;
  const partnerMode = data.mode === 'partner';
  const p = data.partner;
  // In Partner mode every tool works on the partner, not on the learner's own brand
  const active = partnerMode ? { name: p.name, description: p.description, hashtags: p.hashtags, website: p.referralLink || p.website } : data.brand;
  const brandReady = Boolean(active?.name && active?.description);
  const current = tab ?? (brandReady ? 'creator' : 'brand');
  const guards = partnerMode
    ? { doc: (d) => checkRelevance(docText(d), p), scenes: (sc) => checkRelevance(scenesText(sc), p), request: (t) => checkRequest(t, p) }
    : {};
  const sForTools = { ...data, brand: active };

  async function postToShowcase(file, title) {
    try {
      const fd = new FormData();
      fd.set('title', title);
      fd.set('channel', 'social');
      fd.set('visibility', 'private');
      fd.set('video', file);
      await api.post('/showcase', fd);
      toast('Added to My videos in the Showcase (private). Share it from there.', 'success');
    } catch (e) {
      toast(e.message, 'error');
    }
  }

  return (
    <div className="stack" style={{ '--gap': '18px' }}>
      <header className="lab-head">
        <div>
          <h1 style={{ margin: 0 }}>🧪 My Marketing Lab</h1>
          <p className="muted" style={{ margin: 0 }}>{partnerMode ? <>Creating for the <b>{p.displayName}</b>: everything here promotes our partner.</> : brandReady ? <>Marketing <b>{data.brand.name}</b> with every tool in one place.</> : 'Set up your brand, then create posts, designs and videos for it.'}</p>
        </div>
        {partnerMode && <span className="chip chip-brand">🛡️ Partner mode · Partner Guard on</span>}
        {user?.role === 'kid' && <span className="chip">👨‍👩‍👧 A parent approves anything posted publicly</span>}
      </header>
      <div className="tabs lab-tabs" role="tablist">
        {TABS.map(([k, icon, label]) => (
          <button key={k} role="tab" className="tab" aria-selected={current === k} onClick={() => setTab(k)}><span aria-hidden>{icon}</span> {label}</button>
        ))}
      </div>
      {current === 'brand' && (partnerMode ? <PartnerCard partner={p} missionId={data.missionId} /> : <BrandForm brand={data.brand} onSaved={(b) => { setData({ ...data, brand: b }); setTab('creator'); }} />)}
      {current === 'team' && <AgentsPanel />}
      {current === 'tools' && <Toolkit s={sForTools} brandReady={brandReady} onHandoff={(h) => { setHandoff(h); setTab(h.kind === 'video' ? 'video' : 'design'); }} />}
      {current === 'creator' && <Creator brand={active?.name} canvaConnected={canva.data?.connected} guardRequest={guards.request} partnerLabel={partnerMode ? p.displayName : null}
        onEdit={(doc, name) => { setHandoff({ kind: 'doc', doc, name }); setTab('design'); }}
        onVideo={(scenes) => { setHandoff({ kind: 'video', scenes }); setTab('video'); }} />}
      {current === 'design' && <DesignStudio brand={active} guardDoc={guards.doc} handoff={handoff?.kind === 'design' || handoff?.kind === 'doc' ? handoff : null} clearHandoff={() => setHandoff(null)} canva={canva.data} reloadCanva={canva.reload} />}
      {current === 'video' && <VideoMaker key={handoff?.kind === 'video' ? handoff.scenes[0]?.id : 'default'} brand={active?.name} guardScenes={guards.scenes} initialScenes={handoff?.kind === 'video' ? handoff.scenes : undefined} onPostToShowcase={postToShowcase} />}
      {current === 'files' && <Files s={data} />}
    </div>
  );
}
