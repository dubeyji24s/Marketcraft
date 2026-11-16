/* global __PREVIEW__ */
// My Marketing Lab: unlocked by the Ambassador certificate. Graduates market their OWN
// product or service with every tool in one place.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApi } from '../lib/useApi.js';
import { api } from '../lib/api.js';
import { ErrorBox, Loading, ConfirmButton } from '../components/common.jsx';
import { OutputView } from './Ambassador.jsx';
import DesignEditor, { blankDoc, renderDoc, PRESETS } from '../components/DesignEditor.jsx';
import VideoMaker from '../components/VideoMaker.jsx';
import { downloadBlob, downloadText, outputToText, safeName } from '../lib/download.js';
import { useUI } from '../store/ui.js';
import { useAuth } from '../store/auth.js';

const NO_DOWNLOADS = __PREVIEW__;
const TABS = [
  ['brand', '🏷️', 'My brand'],
  ['tools', '🧰', 'AI Toolkit'],
  ['design', '🎨', 'Design Studio'],
  ['video', '🎬', 'Video Maker'],
  ['files', '📁', 'My files'],
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
        <h2>Unlock it with your Ambassador certificate</h2>
        <p className="muted">Pass a Studio challenge, join the Ambassador Program, then complete the <b>Ambassador Mission</b> for the partner website with {s.passThreshold}% or more.</p>
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
function Toolkit({ s, brandReady, onRun }) {
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
        {!brandReady && <div className="alert alert-info small">Fill in <b>My brand</b> first so the tools know what to market.</div>}
        {!s.aiEnabled && <div className="alert alert-info small">The AI tools switch on once the server has a Claude API key. You can still read each tool's guide.</div>}
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

        {results.map((r) => {
          const t = s.tools.find((x) => x.id === r.toolId);
          return (
            <div key={r.id} className="card page-enter">
              <div className="row spread" style={{ marginBottom: 8 }}>
                <b>{t?.icon} {t?.name}</b>
                <span className="row">
                  <button className="btn btn-sm" onClick={() => navigator.clipboard?.writeText(outputToText(r.output)).then(() => toast('Copied!', 'success'), () => {})}>Copy</button>
                  <button className="btn btn-sm btn-primary" disabled={NO_DOWNLOADS} onClick={() => downloadText(outputToText(r.output), `${safeName(t?.name)}.txt`)}>⬇️ Download</button>
                </span>
              </div>
              <OutputView value={r.output} toast={toast} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DesignStudio({ brand, onPostToShowcase }) {
  const { data, reload } = useApi('/lab/designs');
  const [open, setOpen] = useState(null); // { id?, name, doc }
  const [saving, setSaving] = useState(false);
  const toast = useUI((x) => x.toast);

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
        <DesignEditor key={open.id ?? 'new'} initial={open.doc} name={open.name} brand={brand?.name} onSave={save} saving={saving} downloadsDisabled={NO_DOWNLOADS} />
        {NO_DOWNLOADS && <p className="hint">Preview mode: designs save here; PNG/JPG downloads work in the full app.</p>}
      </div>
    );
  }

  return (
    <div className="stack" style={{ '--gap': '18px' }}>
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
      {NO_DOWNLOADS && <div className="alert alert-info small">Preview mode: downloads work in the full app.</div>}
      <div className="card">
        <div className="row spread"><h2 style={{ margin: 0 }}>✍️ AI drafts</h2>
          <button className="btn btn-sm btn-primary" disabled={NO_DOWNLOADS || !runs.data?.runs?.length} onClick={downloadAll}>⬇️ Download all</button></div>
        {!runs.data?.runs?.length ? <p className="muted">No AI drafts yet. Use the AI Toolkit tab.</p> : (
          <ul className="checklist">
            {runs.data.runs.map((r) => (
              <li key={r.id} style={{ display: 'block' }}>
                <div className="row spread">
                  <span><b>{names[r.toolId]?.icon} {names[r.toolId]?.name}</b> <span className="muted small">{new Date(r.createdAt).toLocaleString()}</span></span>
                  <span className="row">
                    <button className="btn btn-sm" onClick={() => setOpenRun(openRun === r.id ? null : r.id)}>{openRun === r.id ? 'Hide' : 'Open'}</button>
                    <button className="btn btn-sm" disabled={NO_DOWNLOADS} onClick={() => downloadText(outputToText(r.output), `${safeName(names[r.toolId]?.name)}.txt`)}>⬇️ .txt</button>
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
                <button className="btn btn-sm btn-primary" disabled={NO_DOWNLOADS} onClick={() => downloadDesign(d)}>⬇️ PNG</button>
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
  const toast = useUI((x) => x.toast);
  const user = useAuth((x) => x.user);

  if (error) return <ErrorBox error={error} />;
  if (loading || !data) return <Loading />;
  if (!data.unlocked) return <Locked s={data} />;
  const brandReady = Boolean(data.brand?.name && data.brand?.description);
  const current = tab ?? (brandReady ? 'tools' : 'brand');

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
          <p className="muted" style={{ margin: 0 }}>{brandReady ? <>Marketing <b>{data.brand.name}</b> with every tool in one place.</> : 'Set up your brand, then create posts, designs and videos for it.'}</p>
        </div>
        {user?.role === 'kid' && <span className="chip">👨‍👩‍👧 A parent approves anything posted publicly</span>}
      </header>
      <div className="tabs lab-tabs" role="tablist">
        {TABS.map(([k, icon, label]) => (
          <button key={k} role="tab" className="tab" aria-selected={current === k} onClick={() => setTab(k)}><span aria-hidden>{icon}</span> {label}</button>
        ))}
      </div>
      {current === 'brand' && <BrandForm brand={data.brand} onSaved={(b) => { setData({ ...data, brand: b }); setTab('tools'); }} />}
      {current === 'tools' && <Toolkit s={data} brandReady={brandReady} />}
      {current === 'design' && <DesignStudio brand={data.brand} />}
      {current === 'video' && <VideoMaker brand={data.brand?.name} downloadsDisabled={NO_DOWNLOADS} onPostToShowcase={postToShowcase} />}
      {current === 'files' && <Files s={data} />}
    </div>
  );
}
