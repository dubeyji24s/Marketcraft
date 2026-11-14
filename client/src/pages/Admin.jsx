import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApi } from '../lib/useApi.js';
import { api } from '../lib/api.js';
import { ErrorBox, ConfirmButton } from '../components/common.jsx';
import { useUI } from '../store/ui.js';
import { ShowcaseReview } from './Showcase.jsx';

const EMPTY = { title: '', businessName: '', ownerName: '', videoUrl: '', summary: '', takeaways: '', transcriptSummary: '', transcript: '', tags: '' };

function InterviewManager() {
  const { data, error, reload } = useApi('/interviews');
  const toast = useUI((s) => s.toast);
  const [form, setForm] = useState(EMPTY);
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [summarizing, setSummarizing] = useState(false);
  const [err, setErr] = useState(null);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function aiSummarize() {
    setSummarizing(true);
    setErr(null);
    try {
      const r = await api.post('/interviews/summarize', { title: form.title || 'Interview', businessName: form.businessName, transcript: form.transcript });
      setForm((f) => ({ ...f, summary: r.summary, takeaways: r.takeaways.join('\n'), tags: r.tags.join('\n'), transcriptSummary: f.transcriptSummary || r.summary }));
      toast('Summary drafted — review and edit before publishing.', 'success');
    } catch (e) {
      setErr(e);
    } finally {
      setSummarizing(false);
    }
  }

  async function save(e) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => k !== 'transcript' && fd.set(k, v));
    if (file) fd.set('video', file);
    try {
      await api.post('/interviews', fd);
      setForm(EMPTY);
      setFile(null);
      toast('Interview published!', 'success');
      reload();
    } catch (e2) {
      setErr(e2);
    } finally {
      setBusy(false);
    }
  }

  async function remove(id) {
    await api.del(`/interviews/${id}`);
    reload();
  }

  async function togglePublish(i) {
    await api.patch(`/interviews/${i.id}`, { published: !i.published });
    reload();
  }

  return (
    <div className="two-col">
      <form className="card" onSubmit={save}>
        <h2>Upload an interview</h2>
        <ErrorBox error={err} />
        <div className="field"><label htmlFor="t">Title</label><input id="t" type="text" value={form.title} onChange={set('title')} required /></div>
        <div className="row" style={{ alignItems: 'flex-start' }}>
          <div className="field" style={{ flex: 1 }}><label htmlFor="o">Owner</label><input id="o" type="text" value={form.ownerName} onChange={set('ownerName')} /></div>
          <div className="field" style={{ flex: 1 }}><label htmlFor="b">Business</label><input id="b" type="text" value={form.businessName} onChange={set('businessName')} /></div>
        </div>
        <div className="field">
          <label htmlFor="vf">Video file</label>
          <input id="vf" type="file" accept="video/mp4,video/webm,video/quicktime" onChange={(e) => setFile(e.target.files[0] || null)} />
          <div className="hint">…or paste a YouTube / Vimeo / Loom link instead:</div>
          <input type="url" aria-label="Video link" placeholder="https://youtube.com/watch?v=…" value={form.videoUrl} onChange={set('videoUrl')} style={{ marginTop: 6 }} />
        </div>
        <div className="field">
          <label htmlFor="tr">Full transcript <span className="muted">(used by AI to draft takeaways; not published)</span></label>
          <textarea id="tr" value={form.transcript} onChange={set('transcript')} />
          <button type="button" className="btn btn-sm" style={{ marginTop: 8 }} onClick={aiSummarize} disabled={summarizing || form.transcript.trim().length < 200}>
            {summarizing ? <span className="spinner" /> : '✨ Draft summary & takeaways with AI'}
          </button>
        </div>
        <div className="field"><label htmlFor="s">Summary</label><textarea id="s" style={{ minHeight: 80 }} value={form.summary} onChange={set('summary')} /></div>
        <div className="field"><label htmlFor="k">Key takeaways (one per line)</label><textarea id="k" style={{ minHeight: 90 }} value={form.takeaways} onChange={set('takeaways')} /></div>
        <div className="field"><label htmlFor="ts">Transcript summary</label><textarea id="ts" style={{ minHeight: 80 }} value={form.transcriptSummary} onChange={set('transcriptSummary')} /></div>
        <div className="field"><label htmlFor="tg">Tags (one per line)</label><textarea id="tg" style={{ minHeight: 60 }} value={form.tags} onChange={set('tags')} /></div>
        <button className="btn btn-primary" disabled={busy || !form.title || (!file && !form.videoUrl)}>{busy ? <span className="spinner" /> : 'Publish interview'}</button>
      </form>
      <div className="card">
        <h2>Library ({data?.interviews.length ?? 0})</h2>
        <ErrorBox error={error} />
        <ul className="checklist">
          {data?.interviews.map((i) => (
            <li key={i.id} className="row spread">
              <span style={{ flex: 1 }}>{i.title}<br /><span className="muted small">{i.videoFile ? 'Uploaded file' : i.embedUrl ? 'Embedded link' : 'No video'}</span></span>
              <button className="btn btn-sm" onClick={() => togglePublish(i)}>{i.published ? 'Unpublish' : 'Publish'}</button>
              <ConfirmButton onConfirm={() => remove(i.id)} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function LessonModeration() {
  const { data, error, reload } = useApi('/lessons');
  const toast = useUI((s) => s.toast);
  async function patch(id, body) {
    try {
      await api.patch(`/lessons/${id}`, body);
      reload();
    } catch (e) {
      toast(e.message, 'error');
    }
  }
  async function remove(id) {
    await api.del(`/lessons/${id}`);
    reload();
  }
  return (
    <div className="card">
      <h2>Lessons</h2>
      <p className="muted small">Generate admin drafts with the Research Engine on the <Link to="/app/learn">Learn</Link> page, then review and publish here. Drafts that fail the originality check can't be published.</p>
      <ErrorBox error={error} />
      <ul className="checklist">
        {data?.lessons.map((l) => (
          <li key={l.id} className="row spread">
            <span style={{ flex: 1, minWidth: 200 }}>
              <Link to={`/app/learn/${l.id}`}>{l.title}</Link><br />
              <span className="muted small">{l.generatedBy === 'ai' ? 'AI' : 'Staff'} · for {(l.audiences || []).join(', ')} · originality {l.originality?.score ?? '—'}</span>
            </span>
            <span className={`chip ${l.published ? 'chip-success' : ''}`}>{l.published ? 'Published' : 'Draft'}</span>
            <button className="btn btn-sm" onClick={() => patch(l.id, { published: !l.published })}>{l.published ? 'Unpublish' : 'Publish'}</button>
            <ConfirmButton onConfirm={() => remove(l.id)} />
          </li>
        ))}
      </ul>
    </div>
  );
}

const BRIEF_FIELDS = [
  ['name', 'Company name', 'text', 'e.g. Alpha Trend'],
  ['website', 'Website URL', 'url', 'https://… (ambassadors log in here with the same account)'],
  ['tagline', 'Tagline', 'text', 'One line that sums up the company'],
  ['description', 'What the company does', 'textarea', 'Plain-language description'],
  ['products', 'Products / services', 'textarea', 'One per line, with key features'],
  ['audience', 'Ideal customers', 'textarea', 'Who it is for'],
  ['keyMessages', 'Key messages', 'textarea', 'The 3-5 things every ambassador should get across'],
  ['offers', 'Current real offers', 'textarea', 'Only offers that actually exist (leave blank if none)'],
  ['voice', 'Brand voice', 'text', 'e.g. confident, friendly, no slang'],
  ['dos', "Do's", 'textarea', 'e.g. Show the product in real use'],
  ['donts', "Don'ts", 'textarea', 'e.g. Never promise financial returns'],
  ['hashtags', 'Official hashtags', 'text', '#…'],
];

function CompanyBrief() {
  const { data, error } = useApi('/ambassador/brief');
  const toast = useUI((s) => s.toast);
  const [form, setForm] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const f = form ?? data?.brief;
  if (error) return <ErrorBox error={error} />;
  if (!f) return null;

  async function save(e) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      const { brief } = await api.put('/ambassador/brief', f);
      setForm(brief);
      toast('Company brief saved. The AI tools now use it.', 'success');
    } catch (e2) {
      setErr(e2);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="card" onSubmit={save}>
      <h2>Company brief</h2>
      <p className="muted small">
        Everything ambassadors and the AI tools are allowed to say about the company comes from here. The AI is instructed never to invent facts,
        so the more accurate detail you add, the better the marketing. The website URL also builds each ambassador's referral link.
      </p>
      <ErrorBox error={err} />
      <div className="grid" style={{ '--min': '300px', gap: '0 18px' }}>
        {BRIEF_FIELDS.map(([k, label, type, ph]) => (
          <div className="field" key={k} style={type === 'textarea' ? { gridColumn: '1 / -1' } : undefined}>
            <label htmlFor={`b-${k}`}>{label}</label>
            {type === 'textarea' ? (
              <textarea id={`b-${k}`} style={{ minHeight: 80 }} placeholder={ph} value={f[k] ?? ''} onChange={(e) => setForm({ ...f, [k]: e.target.value })} />
            ) : (
              <input id={`b-${k}`} type={type} placeholder={ph} value={f[k] ?? ''} onChange={(e) => setForm({ ...f, [k]: e.target.value })} />
            )}
          </div>
        ))}
      </div>
      <button className="btn btn-primary" disabled={busy || !f.name}>{busy ? <span className="spinner" /> : 'Save brief'}</button>
    </form>
  );
}

function Roster() {
  const { data, error } = useApi('/ambassador/roster');
  if (error) return <ErrorBox error={error} />;
  const list = data?.ambassadors ?? [];
  return (
    <div className="card">
      <h2>Ambassadors ({list.length})</h2>
      <p className="muted small">Graduates who joined the program. Their referral code appears as <code>?ref=CODE</code> in visits to your company website.</p>
      {list.length === 0 ? <p className="muted">No ambassadors yet.</p> : (
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead><tr><th>Name</th><th>Role</th><th>Code</th><th>Joined</th><th>AI drafts</th><th>Mission</th></tr></thead>
            <tbody>
              {list.map((a) => (
                <tr key={a.id}>
                  <td>{a.name}<div className="muted small">{a.email}</div></td>
                  <td>{a.roleLabel}{a.accountHolder === 'parent' ? ' (parent account)' : ''}</td>
                  <td><code>{a.ambassador.code}</code></td>
                  <td>{new Date(a.ambassador.joinedAt).toLocaleDateString()}</td>
                  <td>{a.toolRuns}</td>
                  <td>{a.missionCertified ? <span className="chip chip-success">🌟 Certified</span> : <span className="chip">In progress</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function Admin() {
  const [tab, setTab] = useState('interviews');
  return (
    <div className="stack" style={{ '--gap': '22px' }}>
      <h1>Admin 🛠️</h1>
      <div className="tabs" role="tablist">
        <button role="tab" className="tab" aria-selected={tab === 'interviews'} onClick={() => setTab('interviews')}>Interviews</button>
        <button role="tab" className="tab" aria-selected={tab === 'lessons'} onClick={() => setTab('lessons')}>Lessons</button>
        <button role="tab" className="tab" aria-selected={tab === 'brief'} onClick={() => setTab('brief')}>Company brief</button>
        <button role="tab" className="tab" aria-selected={tab === 'roster'} onClick={() => setTab('roster')}>Ambassadors</button>
        <button role="tab" className="tab" aria-selected={tab === 'showcase'} onClick={() => setTab('showcase')}>Showcase review</button>
      </div>
      {{ interviews: <InterviewManager />, lessons: <LessonModeration />, brief: <CompanyBrief />, roster: <Roster />, showcase: <ShowcaseReview /> }[tab]}
    </div>
  );
}
