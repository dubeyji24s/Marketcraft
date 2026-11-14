import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useApi } from '../lib/useApi.js';
import { api } from '../lib/api.js';
import { ErrorBox, Loading } from '../components/common.jsx';
import { useAuth } from '../store/auth.js';
import { useUI } from '../store/ui.js';

const HOW_IT_WORKS = [
  ['🎓', 'Get certified', 'Pass any Studio challenge at the professional standard (ambassadors are 18+; kids join through a parent\'s account).'],
  ['🤝', 'Join the program', 'Agree to the honest-marketing guidelines and get your personal referral link.'],
  ['🌐', 'Use the company website', 'Log in with the same account. You get normal user access, like any customer.'],
  ['🧰', 'Create with AI tools', 'Plan, write and check your marketing with the six tools below.'],
  ['🌟', 'Complete the Ambassador Mission', 'Film a real campaign. Score the pass mark to earn your Brand Ambassador certificate.'],
  ['📈', 'Share & track', 'Share your referral link so the company can see the visitors you bring.'],
];

function copy(text, toast) {
  navigator.clipboard?.writeText(text).then(() => toast('Copied!', 'success'), () => toast('Copy failed: select and copy manually.', 'error'));
}

function Locked({ s }) {
  if (s.certified && !s.adultAccount) {
    return (
      <div className="stack" style={{ '--gap': '22px' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem' }} aria-hidden>🔞</div>
          <h2>The Ambassador Program is for ages 18+</h2>
          <p className="muted">Great job getting certified! Ambassadors must be adults. If you're under 18, a parent can sign up with their own account as a Kid Entrepreneur and you can take part together.</p>
        </div>
        <HowItWorks />
      </div>
    );
  }
  return (
    <div className="stack" style={{ '--gap': '22px' }}>
      <header className="card hero-card">
        <h1>🤝 Ambassador Program</h1>
        <p className="muted" style={{ margin: 0 }}>
          Graduates aged 18+ become brand ambassadors for {s.company.name || 'our partner company'}, using pro AI tools to market it and earning an Ambassador certificate. Kids take part through a parent's account.
        </p>
      </header>
      <div className="card" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '3rem' }} aria-hidden>🔒</div>
        <h2>Unlock it by getting certified</h2>
        <p className="muted">Pass any Studio challenge with a score of <b>{s.passThreshold}% or higher</b>. Below that, keep improving and retrying. There's no limit.</p>
        <Link className="btn btn-primary" to="/app/studio">Go to the Studio</Link>
      </div>
      <HowItWorks />
    </div>
  );
}

function HowItWorks() {
  return (
    <section>
      <h2>How the program works</h2>
      <ol className="steps">
        {HOW_IT_WORKS.map(([icon, t, d], i) => (
          <li key={t} className="card">
            <span className="step-num">{i + 1}</span>
            <h3><span aria-hidden>{icon}</span> {t}</h3>
            <p className="muted small" style={{ margin: 0 }}>{d}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Join({ s, onJoined }) {
  const [agree, setAgree] = useState(false);
  const [parentOk, setParentOk] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const celebrate = useUI((x) => x.celebrate);
  const refresh = useAuth((x) => x.refresh);

  async function join() {
    setBusy(true);
    setError(null);
    try {
      const r = await api.post('/ambassador/join', { agreeGuidelines: agree, parentApproval: s.isKid ? parentOk : undefined });
      celebrate({ badges: r.newBadges, xp: 50, title: 'Welcome, Ambassador! 🤝' });
      refresh();
      onJoined(r);
    } catch (e) {
      setError(e);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="stack" style={{ '--gap': '22px' }}>
      <header className="card hero-card">
        <span className="chip" style={{ background: 'rgb(0 0 0 / 0.15)', color: 'inherit' }}>🎉 You're eligible</span>
        <h1 style={{ marginTop: 10 }}>Become a {s.company.name || 'brand'} Ambassador</h1>
        <p className="muted" style={{ margin: 0 }}>Put your new skills to work on a real company with professional AI tools, and earn an Ambassador certificate.</p>
      </header>
      <HowItWorks />
      <div className="card">
        <h2>Ambassador guidelines</h2>
        <ol className="checklist">
          {s.guidelines.map((g, i) => <li key={i}><span aria-hidden>{['🙌', '📣', '🚫', '🔐', '🌐', '✅', '👨‍👩‍👧'][i] ?? '•'}</span>{g}</li>)}
        </ol>
        <ErrorBox error={error} />
        <label className="checkbox field" style={{ marginTop: 16 }}>
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
          <span>I agree to follow these guidelines whenever I market {s.company.name || 'the company'}.</span>
        </label>
        {s.isKid && (
          <label className="checkbox field">
            <input type="checkbox" checked={parentOk} onChange={(e) => setParentOk(e.target.checked)} />
            <span><b>Parent/guardian:</b> I approve my child joining and I will review and post anything public on their behalf.</span>
          </label>
        )}
        <button className="btn btn-primary" disabled={busy || !agree || (s.isKid && !parentOk)} onClick={join}>
          {busy ? <span className="spinner" /> : 'Join the Ambassador Program'}
        </button>
      </div>
    </div>
  );
}

function Member({ s }) {
  const toast = useUI((x) => x.toast);
  const c = s.company;
  return (
    <div className="stack" style={{ '--gap': '22px' }}>
      <header className="card hero-card">
        <div className="row spread">
          <div style={{ minWidth: 0, flex: '1 1 320px' }}>
            <span className="chip" style={{ background: 'rgb(0 0 0 / 0.15)', color: 'inherit' }}>🤝 Ambassador · code {s.ambassador.code}</span>
            <h1 style={{ margin: '10px 0 6px' }}>{c.name || 'Partner company'}</h1>
            <p className="muted" style={{ margin: 0 }}>{c.tagline || c.description || 'The company brief is being prepared by the admin.'}</p>
          </div>
          {c.website && (
            <a className="btn btn-lg" style={{ background: 'var(--on-brand)', color: '#fff', border: 0 }} href={c.website} target="_blank" rel="noopener noreferrer">
              Open {c.name} website ↗
            </a>
          )}
        </div>
      </header>

      {!c.configured && <div className="alert alert-info">The admin hasn't filled in the company brief yet, so the AI tools and Mission will open once it's ready.</div>}
      {!s.aiEnabled && <div className="alert alert-info">The AI tools need the server's AI key to be configured. You can still read every tool guide below.</div>}

      <div className="two-col">
        <div className="card">
          <h3>🌐 Your company-website access</h3>
          <p className="small" style={{ margin: 0 }}>
            Log in to {c.name || 'the company website'} with <b>the same email or Google account</b> you use here. You have a normal user account,
            so explore it like a customer would. That's what makes your marketing genuine.
          </p>
        </div>
        <div className="card">
          <h3>🔗 Your referral link</h3>
          {s.referralLink ? (
            <>
              <code style={{ display: 'block', wordBreak: 'break-all', padding: 10, marginBottom: 10 }}>{s.referralLink}</code>
              <button className="btn btn-sm btn-primary" onClick={() => copy(s.referralLink, toast)}>Copy link</button>
              <p className="hint">Use it in every post so the company knows which visitors came from you. The AI tools add it for you.</p>
            </>
          ) : (
            <p className="muted small" style={{ margin: 0 }}>Your link appears once the admin adds the company website.</p>
          )}
        </div>
      </div>

      {s.mission && (
        <div className="card card-accent" style={{ '--accent': 'linear-gradient(90deg,#00c2a8,#3dd6ff)' }}>
          <div className="row spread">
            <div style={{ flex: '1 1 300px' }}>
              <h2 style={{ marginBottom: 6 }}>🌟 {s.mission.title}</h2>
              <p className="muted small" style={{ margin: 0 }}>
                Your final project: a real campaign video for {c.name || 'the company'}, graded on 5 criteria including brand accuracy and honest disclosure.
                Score <b>{s.passThreshold}%+</b> to earn your Brand Ambassador certificate. Retry as many times as you need.
              </p>
            </div>
            {s.mission.certificateId ? (
              <Link className="btn" to={`/app/certificates/${s.mission.certificateId}`}>🏅 View certificate</Link>
            ) : (
              <Link className="btn btn-primary" to={`/app/studio/${s.mission.id}`}>Start the Mission</Link>
            )}
          </div>
        </div>
      )}

      <section>
        <div className="row spread" style={{ marginBottom: 12 }}>
          <h2 style={{ margin: 0 }}>🧰 AI Marketing Toolkit</h2>
          <Link className="btn btn-sm" to="/app/ambassador/drafts">My saved drafts</Link>
        </div>
        <p className="muted">Use them in this order for a full campaign: <b>Persona → Calendar → Post / Script / Ad → Checker</b>.</p>
        <div className="grid stagger" style={{ '--min': '280px' }}>
          {s.tools.map((t) => (
            <Link key={t.id} to={`/app/ambassador/tools/${t.id}`} className="card interactive card-accent">
              <div style={{ fontSize: '2rem' }} aria-hidden>{t.icon}</div>
              <h3>{t.name}</h3>
              <p className="small" style={{ margin: '0 0 8px', fontWeight: 600 }}>{t.tagline}</p>
              <p className="muted small" style={{ margin: 0 }}>{t.whatItDoes}</p>
            </Link>
          ))}
        </div>
      </section>

      <details className="card">
        <summary style={{ cursor: 'pointer', fontWeight: 700 }}>📜 Ambassador guidelines</summary>
        <ol className="checklist" style={{ marginTop: 10 }}>{s.guidelines.map((g, i) => <li key={i}><span aria-hidden>•</span>{g}</li>)}</ol>
      </details>
    </div>
  );
}

export function AmbassadorHome() {
  const { data, error, loading, setData } = useApi('/ambassador/status');
  if (error) return <ErrorBox error={error} />;
  if (loading || !data) return <Loading />;
  if (data.joined) return <Member s={data} />;
  if (data.eligible) return <Join s={data} onJoined={(r) => setData(r)} />;
  return <Locked s={data} />;
}

// ---------------------------------------------------------------------------
// Tool page: guide + form + result
// ---------------------------------------------------------------------------
const label = (k) => k.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase());

function toText(v, depth = 0) {
  if (v == null) return '';
  if (typeof v !== 'object') return String(v);
  if (Array.isArray(v)) return v.map((x) => (typeof x === 'object' ? toText(x, depth + 1) : `• ${x}`)).join('\n');
  return Object.entries(v).map(([k, x]) => (typeof x === 'object' ? `${label(k)}:\n${toText(x, depth + 1)}` : `${label(k)}: ${x}`)).join('\n') + (depth ? '\n' : '');
}

/** Renders any tool output (objects, lists, strings) with copy buttons. */
export function OutputView({ value, toast }) {
  if (value == null) return null;
  if (typeof value === 'boolean') return <span className={`chip ${value ? 'chip-success' : 'chip-danger'}`}>{value ? 'Yes' : 'No'}</span>;
  if (typeof value !== 'object') {
    const s = String(value);
    return (
      <div className="out-text">
        <p style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{s}</p>
        {s.length > 40 && <button className="btn btn-sm btn-ghost copy-btn" onClick={() => copy(s, toast)} aria-label="Copy text">Copy</button>}
      </div>
    );
  }
  if (Array.isArray(value)) {
    if (value.every((x) => typeof x !== 'object')) {
      return <ul className="small" style={{ paddingLeft: '1.2em', margin: 0 }}>{value.map((x, i) => <li key={i}>{String(x)}</li>)}</ul>;
    }
    return (
      <div className="stack" style={{ '--gap': '12px' }}>
        {value.map((x, i) => (
          <div key={i} className="out-card">
            <div className="row spread" style={{ marginBottom: 6 }}>
              <span className="chip">#{i + 1}</span>
              <button className="btn btn-sm btn-ghost" onClick={() => copy(toText(x), toast)}>Copy</button>
            </div>
            <OutputView value={x} toast={toast} />
          </div>
        ))}
      </div>
    );
  }
  return (
    <dl className="out-dl">
      {Object.entries(value).map(([k, v]) => (
        <div key={k}>
          <dt>{label(k)}</dt>
          <dd><OutputView value={v} toast={toast} /></dd>
        </div>
      ))}
    </dl>
  );
}

export function ToolPage() {
  const { id } = useParams();
  const isAdmin = useAuth((x) => x.user?.role === 'admin');
  const { data, error, loading } = useApi('/ambassador/status');
  const toast = useUI((x) => x.toast);
  const [inputs, setInputs] = useState({});
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [runError, setRunError] = useState(null);

  if (error) return <ErrorBox error={error} />;
  if (loading || !data) return <Loading />;
  const tool = data.tools.find((t) => t.id === id);
  if (!tool) return <ErrorBox error={new Error('Tool not found.')} />;
  const canUse = data.joined || isAdmin;

  const missing = tool.fields.filter((f) => f.required && !(inputs[f.key] ?? '').toString().trim());

  async function run(e) {
    e.preventDefault();
    setBusy(true);
    setRunError(null);
    try {
      const { run } = await api.post(`/ambassador/tools/${tool.id}`, { inputs });
      setResult(run.output);
    } catch (err) {
      setRunError(err);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="stack" style={{ '--gap': '18px' }}>
      <Link to="/app/ambassador" className="muted small">← Ambassador hub</Link>
      <header className="row" style={{ gap: 16 }}>
        <span style={{ fontSize: '2.6rem' }} aria-hidden>{tool.icon}</span>
        <div>
          <h1 style={{ margin: 0 }}>{tool.name}</h1>
          <p className="muted" style={{ margin: 0 }}>{tool.tagline}</p>
        </div>
      </header>

      <div className="two-col">
        <div className="stack" style={{ '--gap': '18px' }}>
          {canUse ? (
            <form className="card" onSubmit={run}>
              <h2>Create</h2>
              <ErrorBox error={runError} />
              {tool.fields.map((f) => (
                <div className="field" key={f.key}>
                  <label htmlFor={f.key}>{f.label}{!f.required && <span className="muted"> (optional)</span>}</label>
                  {f.type === 'select' ? (
                    <select id={f.key} value={inputs[f.key] ?? ''} onChange={(e) => setInputs({ ...inputs, [f.key]: e.target.value })}>
                      <option value="" disabled>Choose…</option>
                      {f.options.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : f.type === 'textarea' ? (
                    <textarea id={f.key} maxLength={f.max} placeholder={f.placeholder} value={inputs[f.key] ?? ''} onChange={(e) => setInputs({ ...inputs, [f.key]: e.target.value })} />
                  ) : (
                    <input id={f.key} type="text" maxLength={f.max} placeholder={f.placeholder} value={inputs[f.key] ?? ''} onChange={(e) => setInputs({ ...inputs, [f.key]: e.target.value })} />
                  )}
                </div>
              ))}
              <button className="btn btn-primary" disabled={busy || missing.length > 0}>{busy ? <><span className="spinner" /> Working…</> : `✨ Generate`}</button>
            </form>
          ) : (
            <div className="alert alert-info">Join the <Link to="/app/ambassador">Ambassador Program</Link> to use this tool.</div>
          )}

          {busy && (
            <div className="card loading-orbit" role="status"><div className="rocket" aria-hidden>{tool.icon}</div><b>Creating with the company brief…</b></div>
          )}
          {result && !busy && (
            <div className="card page-enter" aria-live="polite">
              <div className="row spread" style={{ marginBottom: 10 }}>
                <h2 style={{ margin: 0 }}>Result</h2>
                <span className="row">
                  <button className="btn btn-sm" onClick={() => copy(toText(result), toast)}>Copy all</button>
                  <Link className="btn btn-sm btn-ghost" to="/app/ambassador/drafts">Saved to drafts ✓</Link>
                </span>
              </div>
              <p className="hint" style={{ marginTop: 0 }}>AI drafts are a starting point. Make them sound like you, then run the Compliance & Brand Checker before posting.</p>
              <OutputView value={result} toast={toast} />
            </div>
          )}
        </div>

        <aside className="card guide">
          <h3>📘 What it does</h3>
          <p className="small">{tool.whatItDoes}</p>
          <h3>⏰ When to use it</h3>
          <p className="small">{tool.whenToUse}</p>
          <h3>🪜 How to use it</h3>
          <ol className="small" style={{ paddingLeft: '1.2em', lineHeight: 1.7 }}>{tool.howTo.map((h, i) => <li key={i}>{h}</li>)}</ol>
          <div className="alert alert-success small" style={{ margin: 0 }}><b>💡 Pro tip:</b> {tool.proTip}</div>
        </aside>
      </div>
    </div>
  );
}

export function Drafts() {
  const { data, error, loading, reload } = useApi('/ambassador/runs');
  const status = useApi('/ambassador/status');
  const toast = useUI((x) => x.toast);
  const [open, setOpen] = useState(null);
  if (error) return <ErrorBox error={error} />;
  if (loading || status.loading) return <Loading />;
  const names = Object.fromEntries((status.data?.tools ?? []).map((t) => [t.id, t]));
  async function remove(id) {
    await api.del(`/ambassador/runs/${id}`);
    reload();
  }
  return (
    <div className="stack" style={{ '--gap': '18px' }}>
      <Link to="/app/ambassador" className="muted small">← Ambassador hub</Link>
      <h1>My saved drafts</h1>
      <p className="muted">Your 30 most recent AI results are saved here automatically.</p>
      {data.runs.length === 0 && <div className="card muted">No drafts yet. Open a tool from the hub to create one.</div>}
      {data.runs.map((r) => (
        <div key={r.id} className="card">
          <div className="row spread">
            <b>{names[r.toolId]?.icon} {names[r.toolId]?.name ?? r.toolId}</b>
            <span className="row small muted">
              {new Date(r.createdAt).toLocaleString()}
              <button className="btn btn-sm" onClick={() => setOpen(open === r.id ? null : r.id)}>{open === r.id ? 'Hide' : 'Open'}</button>
              <button className="btn btn-sm btn-danger" onClick={() => remove(r.id)}>Delete</button>
            </span>
          </div>
          {open === r.id && <div style={{ marginTop: 12 }}><OutputView value={r.output} toast={toast} /></div>}
        </div>
      ))}
    </div>
  );
}
