import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useApi } from '../lib/useApi.js';
import { api } from '../lib/api.js';
import { extractFrames } from '../lib/frames.js';
import { ErrorBox, Loading, ScoreRing, CHANNEL_INFO } from '../components/common.jsx';
import { VideoPlayer } from './Interviews.jsx';
import { useAuth } from '../store/auth.js';
import { useUI } from '../store/ui.js';

const DIFF = { starter: '🌱 Starter', intermediate: '🔥 Intermediate', advanced: '🚀 Advanced' };

export function StudioHome() {
  const { data, error, loading } = useApi('/studio/challenges');
  const navigate = useNavigate();
  const toast = useUI((s) => s.toast);

  async function assign() {
    try {
      const r = await api.post('/studio/challenges/assign');
      if (r.challenge) navigate(`/app/studio/${r.challenge.id}`);
      else toast(r.message, 'success');
    } catch (e) {
      toast(e.message, 'error');
    }
  }

  return (
    <div className="stack" style={{ '--gap': '22px' }}>
      <header className="row spread">
        <div>
          <h1>Practice Hands-On Studio 🎬</h1>
          <p className="muted" style={{ margin: 0 }}>Pick a product challenge, plan your strategy, film a short pitch, get AI coaching.</p>
        </div>
        <button className="btn btn-primary" onClick={assign}>🎲 Assign me one</button>
      </header>
      <ErrorBox error={error} />
      {loading ? (
        <div className="grid"><div className="skeleton" /><div className="skeleton" /><div className="skeleton" /></div>
      ) : (
        <div className="grid stagger" style={{ '--min': '280px' }}>
          {data.challenges.map((c) => (
            <Link key={c.id} to={`/app/studio/${c.id}`} className="card interactive card-accent" style={{ '--accent': c.color }}>
              <div className="row" style={{ marginBottom: 10 }}>
                <span className="chip">{DIFF[c.difficulty]}</span>
                <span className="chip">{CHANNEL_INFO[c.channel]?.emoji} {CHANNEL_INFO[c.channel]?.label}</span>
                <span className="chip chip-success">Budget {c.budget}</span>
              </div>
              <h3>{c.title}</h3>
              <p className="muted small">{c.product}</p>
              <div className="row spread small">
                <span>{c.passed ? <span className="chip chip-success">🏅 Passed</span> : c.attempts ? `${c.attempts} attempt${c.attempts > 1 ? 's' : ''}` : 'Not started'}</span>
                {c.attempts > 0 && <span className="muted">Best {c.bestScore}%</span>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function PlanChecklist({ challenge }) {
  const key = `lp-plan-${challenge.id}`;
  const items = [
    'Who exactly is my customer? (age, place, what they care about)',
    'What problem does my product solve for them?',
    'What makes mine different or better? (my value proposition)',
    'My 3-second hook (motion, question, or product in action)',
    `How it fits the channel: ${CHANNEL_INFO[challenge.channel]?.label}`,
    `Stays within budget: ${challenge.budget}`,
    'One clear call to action at the end',
    'Good light, product close-up, captions on',
  ];
  const [checked, setChecked] = useState(() => {
    try { return JSON.parse(localStorage.getItem(key)) || {}; } catch { return {}; }
  });
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(checked)); } catch { /* storage unavailable */ }
  }, [key, checked]);
  const done = Object.values(checked).filter(Boolean).length;
  return (
    <div className="card">
      <div className="row spread"><h3 style={{ margin: 0 }}>📝 Plan your pitch</h3><span className="chip">{done}/{items.length}</span></div>
      <div className="progress" style={{ margin: '10px 0' }}><span style={{ width: `${(done / items.length) * 100}%` }} /></div>
      <ul className="checklist">
        {items.map((t, i) => (
          <li key={i}>
            <label className="checkbox" style={{ fontWeight: 500, margin: 0 }}>
              <input type="checkbox" checked={!!checked[i]} onChange={(e) => setChecked({ ...checked, [i]: e.target.checked })} />
              <span>{t}</span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SubmissionForm({ challenge, onResult, aiEnabled }) {
  const [mode, setMode] = useState('upload');
  const [file, setFile] = useState(null);
  const [frames, setFrames] = useState([]);
  const [extracting, setExtracting] = useState(false);
  const [drag, setDrag] = useState(false);
  const [form, setForm] = useState({ videoUrl: '', explanation: '', transcript: '', channel: challenge.channel });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  async function pickFile(f) {
    if (!f) return;
    if (!f.type.startsWith('video/')) return setError(new Error('Please choose a video file.'));
    if (f.size > 200 * 1024 * 1024) return setError(new Error('Video must be under 200 MB.'));
    setError(null);
    setFile(f);
    setExtracting(true);
    setFrames(await extractFrames(f));
    setExtracting(false);
  }

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const fd = new FormData();
    fd.set('challengeId', challenge.id);
    fd.set('channel', form.channel);
    fd.set('explanation', form.explanation);
    fd.set('transcript', form.transcript);
    if (mode === 'upload' && file) {
      fd.set('video', file);
      fd.set('frames', JSON.stringify(frames));
    } else {
      fd.set('videoUrl', form.videoUrl);
    }
    try {
      onResult(await api.post('/studio/submissions', fd));
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  }

  const hasVideo = mode === 'upload' ? !!file : /^https:\/\/.+/.test(form.videoUrl);
  const canSubmit = hasVideo && form.explanation.trim().length >= 60 && !extracting && !busy;

  if (busy) {
    return (
      <div className="card loading-orbit" role="status">
        <div className="rocket" aria-hidden>🤖</div>
        <b>Your AI coach is reviewing your pitch…</b>
        <span className="muted small">Checking clarity, audience focus, value proposition and visual appeal.</span>
      </div>
    );
  }

  return (
    <form className="card" onSubmit={submit}>
      <h2>📤 Submit your pitch</h2>
      {!aiEnabled && <div className="alert alert-info small">⚡ <b>Free scoring mode:</b> your pitch is scored on the rubric from your written strategy and script. Explain your hook, customer, value and visuals clearly.</div>}
      <ErrorBox error={error} />
      <div className="tabs" role="tablist" style={{ marginBottom: 14 }}>
        <button type="button" role="tab" className="tab" aria-selected={mode === 'upload'} onClick={() => setMode('upload')}>Upload video</button>
        <button type="button" role="tab" className="tab" aria-selected={mode === 'link'} onClick={() => setMode('link')}>Paste a link</button>
      </div>
      {mode === 'upload' ? (
        <div className="field">
          <div
            className={`dropzone ${drag ? 'drag' : ''}`}
            role="button"
            tabIndex={0}
            onClick={() => inputRef.current?.click()}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => { e.preventDefault(); setDrag(false); pickFile(e.dataTransfer.files[0]); }}
          >
            <div style={{ fontSize: '2rem' }} aria-hidden>🎥</div>
            {file ? <b>{file.name}</b> : <b>Drop your video here or click to choose</b>}
            <div className="hint">MP4, WebM or MOV · up to 200 MB · 30–90 seconds is ideal</div>
          </div>
          <input ref={inputRef} type="file" accept="video/mp4,video/webm,video/quicktime" hidden onChange={(e) => pickFile(e.target.files[0])} />
          {extracting && <div className="row small muted" style={{ marginTop: 8 }}><span className="spinner" /> Capturing frames for visual review…</div>}
          {frames.length > 0 && (
            <>
              <div className="frames">{frames.map((f, i) => <img key={i} src={f} alt={`Frame ${i + 1}`} />)}</div>
              <div className="hint">These {frames.length} stills are what the AI coach sees for visual appeal.</div>
            </>
          )}
        </div>
      ) : (
        <div className="field">
          <label htmlFor="videoUrl">Video link</label>
          <input id="videoUrl" type="url" placeholder="https://youtube.com/… or https://drive.google.com/…" value={form.videoUrl} onChange={(e) => setForm({ ...form, videoUrl: e.target.value })} />
          <div className="hint">Make sure the link is viewable. Describe your visuals in the explanation, since the coach can't watch links directly.</div>
        </div>
      )}
      <div className="field">
        <label>Campaign channel</label>
        <div className="segmented">
          {Object.entries(CHANNEL_INFO).map(([k, c]) => (
            <button type="button" key={k} className="choice" aria-pressed={form.channel === k} onClick={() => setForm({ ...form, channel: k })}>
              <span className="emoji" aria-hidden>{c.emoji}</span>{c.label}
            </button>
          ))}
        </div>
      </div>
      <div className="field">
        <label htmlFor="explanation">Your marketing strategy</label>
        <textarea id="explanation" value={form.explanation} maxLength={4000} onChange={(e) => setForm({ ...form, explanation: e.target.value })}
          placeholder="Who is your customer? What's your hook? Why should they buy? Where will this run and how does it stay on budget?" />
        <div className="hint">{form.explanation.trim().length < 60 ? `${60 - form.explanation.trim().length} more characters needed` : `${form.explanation.length}/4000`}</div>
      </div>
      <div className="field">
        <label htmlFor="transcript">What you say in the video <span className="muted">(optional, but helps the coach)</span></label>
        <textarea id="transcript" style={{ minHeight: 90 }} value={form.transcript} maxLength={8000} onChange={(e) => setForm({ ...form, transcript: e.target.value })} />
      </div>
      <button className="btn btn-primary" disabled={!canSubmit}>Get my score</button>
    </form>
  );
}

function EvaluationReport({ submission, certificate, passThreshold, distinctionThreshold, onRetry }) {
  const ev = submission.evaluation;
  return (
    <div className="card page-enter" aria-live="polite">
      <div className="row" style={{ gap: 24, alignItems: 'center' }}>
        <ScoreRing percent={ev.percent} passed={ev.passed} />
        <div style={{ flex: 1, minWidth: 220 }}>
          <span className={`chip ${ev.passed ? 'chip-success' : 'chip-brand'}`}>
            Attempt #{submission.attempt} · {ev.distinction ? '🏆 Distinction' : ev.passed ? '🏅 Passed' : `Pass mark ${passThreshold}%`}
          </span>
          <h2 style={{ marginTop: 10 }}>{ev.passed ? (ev.distinction ? 'Outstanding pitch!' : 'Professional standard reached! 🎉') : ev.percent >= passThreshold - 15 ? 'So close, keep going! 💪' : 'Good start. Let\'s level it up! 💪'}</h2>
          {!ev.passed && (
            <p className="small" style={{ margin: '0 0 6px' }}>
              You need <b>{passThreshold - ev.percent} more points</b> to reach the professional {passThreshold}% standard. Use the tips below and try again; there's no limit.
            </p>
          )}
          <p className="muted" style={{ margin: 0 }}>{ev.encouragement}</p>
          {ev.mode === 'offline-demo' && <p className="small muted">Scored in offline demo mode.</p>}
        </div>
      </div>

      <div className="stack" style={{ '--gap': '14px', marginTop: 22 }}>
        {ev.criteria.map((c) => (
          <div key={c.key}>
            <div className="row spread"><b>{c.label}</b><span>{c.score}/{c.max}</span></div>
            <div className="progress" style={{ margin: '6px 0' }}><span style={{ width: `${(c.score / c.max) * 100}%` }} /></div>
            <p className="small muted" style={{ margin: '0 0 2px' }}>{c.evidence}</p>
            <p className="small" style={{ margin: 0 }}>💡 {c.tip}</p>
          </div>
        ))}
      </div>

      <div className="two-col" style={{ marginTop: 20 }}>
        {ev.strengths.length > 0 && (
          <div><h3>✨ What worked</h3><ul className="small" style={{ paddingLeft: '1.2em' }}>{ev.strengths.map((s, i) => <li key={i}>{s}</li>)}</ul></div>
        )}
        {ev.nextSteps.length > 0 && (
          <div><h3>🎯 {ev.passed ? 'Level up next time' : 'Try this on your next attempt'}</h3><ul className="small" style={{ paddingLeft: '1.2em' }}>{ev.nextSteps.map((s, i) => <li key={i}>{s}</li>)}</ul></div>
        )}
      </div>

      <div className="row" style={{ marginTop: 16 }}>
        {certificate && <Link className="btn btn-primary" to={`/app/certificates/${certificate.id}`}>🏅 View my certificate</Link>}
        {!ev.distinction && <button className={`btn ${ev.passed ? '' : 'btn-primary'}`} onClick={onRetry}>{ev.passed ? `Go for distinction (${distinctionThreshold}%)` : '🔁 Improve & try again'}</button>}
        {certificate?.kind !== 'ambassador' && ev.passed && <Link className="btn btn-ghost" to="/app/ambassador">🤝 Ambassador Program unlocked →</Link>}
      </div>
    </div>
  );
}

export function ChallengeView() {
  const { id } = useParams();
  const { data, error, loading, reload } = useApi(`/studio/challenges/${id}`);
  const rubric = useApi('/studio/rubric');
  const refresh = useAuth((s) => s.refresh);
  const celebrate = useUI((s) => s.celebrate);
  const [latest, setLatest] = useState(null);
  const [showForm, setShowForm] = useState(true);
  const topRef = useRef(null);

  if (error) return <ErrorBox error={error} />;
  if (loading || !data || rubric.loading) return <Loading />;
  const { challenge, attempts } = data;
  const rd = rubric.data ?? { rubrics: { standard: { criteria: [], points: 25 } }, passThreshold: 85, distinctionThreshold: 95, aiEnabled: false };
  const rb = rd.rubrics[challenge.kind === 'ambassador' ? 'ambassador' : 'standard'] ?? rd.rubrics.standard;
  const r = { ...rd, rubric: rb.criteria, pointsPerCriterion: rb.points };

  function onResult(res) {
    setLatest(res);
    setShowForm(false);
    reload();
    refresh();
    const ev = res.submission.evaluation;
    if (ev.passed) celebrate({ badges: res.newBadges, xp: res.xpEarned, title: ev.distinction ? 'Distinction earned! 🏆' : 'Certificate unlocked! 🏅' });
    else celebrate({ badges: res.newBadges, xp: res.xpEarned });
    topRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <div className="two-col" ref={topRef}>
      <div className="stack" style={{ '--gap': '18px' }}>
        <Link to="/app/studio" className="muted small">← All challenges</Link>
        <header className="card card-accent" style={{ '--accent': challenge.color }}>
          <div className="row" style={{ marginBottom: 8 }}>
            <span className="chip">{DIFF[challenge.difficulty]}</span>
            <span className="chip">{CHANNEL_INFO[challenge.channel]?.emoji} {CHANNEL_INFO[challenge.channel]?.label}</span>
            <span className="chip chip-success">Budget {challenge.budget}</span>
            <span className="chip chip-brand">🎖 {challenge.certificateBadge}</span>
          </div>
          <h1>{challenge.title}</h1>
          <p><b>Product:</b> {challenge.product}</p>
          <p style={{ margin: 0 }}>{challenge.brief}</p>
        </header>

        {latest && (
          <EvaluationReport
            submission={latest.submission}
            certificate={latest.certificate}
            passThreshold={r.passThreshold}
            distinctionThreshold={r.distinctionThreshold}
            onRetry={() => { setShowForm(true); setLatest(null); }}
          />
        )}
        {challenge.kind === 'ambassador' && (
          <div className="alert alert-info small">🧰 Plan this mission with the <Link to="/app/ambassador">AI Marketing Toolkit</Link>: build a persona, write your script, then run the Compliance & Brand Checker. Include your ambassador disclosure and referral link!</div>
        )}
        {showForm && <SubmissionForm challenge={challenge} onResult={onResult} aiEnabled={r.aiEnabled} />}

        {attempts.length > 0 && (
          <div className="card">
            <h3>📜 Your attempts</h3>
            <div className="stack" style={{ '--gap': '12px' }}>
              {attempts.map((a) => (
                <details key={a.id}>
                  <summary style={{ cursor: 'pointer' }} className="row spread">
                    <span>Attempt #{a.attempt} · {new Date(a.createdAt).toLocaleString()}</span>
                    <span className={`chip ${a.evaluation.passed ? 'chip-success' : ''}`}>{a.evaluation.percent}%</span>
                  </summary>
                  <div style={{ marginTop: 10 }}>
                    {(a.videoSrc || a.embedUrl) && <VideoPlayer videoSrc={a.videoSrc} embedUrl={a.embedUrl} title={`Attempt ${a.attempt}`} />}
                    {a.videoUrl && !a.embedUrl && <p className="small"><a href={a.videoUrl} target="_blank" rel="noopener noreferrer">Open video link ↗</a></p>}
                    <p className="small muted" style={{ marginTop: 8 }}>{a.explanation}</p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        )}
      </div>

      <aside className="stack" style={{ '--gap': '18px' }}>
        <div className="card">
          <h3>🎬 Your mission</h3>
          <ol style={{ paddingLeft: '1.2em', lineHeight: 1.7 }} className="small">
            <li>Plan your strategy with the checklist below.</li>
            <li>Record a <b>30–90 second</b> professional pitch or demo with your phone, for {CHANNEL_INFO[challenge.channel]?.label.toLowerCase()}.</li>
            <li>Upload it (or paste a link) with a short written explanation.</li>
            <li>Score <b>{r.passThreshold}%+</b> to earn your certificate, <b>{r.distinctionThreshold}%+</b> for distinction. Unlimited retries!</li>
          </ol>
        </div>
        <PlanChecklist challenge={challenge} />
        <div className="card">
          <h3>📏 How you're scored</h3>
          {r.rubric.map((c) => (
            <div key={c.key} style={{ marginBottom: 12 }}>
              <b>{c.label}</b> <span className="muted small">({r.pointsPerCriterion} pts)</span>
              <p className="small muted" style={{ margin: 0 }}>{c.description}</p>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}
