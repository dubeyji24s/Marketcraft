import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useApi } from '../lib/useApi.js';
import { api } from '../lib/api.js';
import { ErrorBox, Loading, MiniMarkdown } from '../components/common.jsx';
import { useAuth } from '../store/auth.js';
import { useUI } from '../store/ui.js';
import { buildPlan } from '../lib/monthPlan.js';
import { announcePlay } from '../lib/play.js';
import { Icon, IconTile, TONES, TONE_ORDER, topicIcon } from '../components/Icon.jsx';

const WEEK_ICONS = ['compass', 'studio', 'calendar', 'heart', 'rocket'];
import { ScenarioBlock } from '../components/Practice.jsx';
import { LiveTool, LESSON_TOOLS, TOOL_TITLES } from '../components/LiveTools.jsx';

const RESEARCH_STEPS = ['Searching trusted sources…', 'Reading & taking notes…', 'Writing an original lesson…', 'Running the originality check…'];

function ResearchEngine({ onCreated }) {
  const user = useAuth((s) => s.user);
  const [topic, setTopic] = useState('');
  const [audience, setAudience] = useState('adult');
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState(0);
  const [error, setError] = useState(null);

  async function run(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setStep(0);
    const timer = setInterval(() => setStep((s) => Math.min(s + 1, RESEARCH_STEPS.length - 1)), 9000);
    try {
      const { lesson } = await api.post('/lessons/research', { topic, ...(user.role === 'admin' ? { audience } : {}) });
      onCreated(lesson);
      setTopic('');
    } catch (err) {
      setError(err);
    } finally {
      clearInterval(timer);
      setBusy(false);
    }
  }

  const ideas = ['Getting customers from a farmers market booth', 'Free ways to get Google reviews', 'Building an email list from zero', 'Partnering with nearby businesses'];

  return (
    <section className="card card-accent">
      <h2 className="title-with-icon"><IconTile name="brain" tone="violet" size={40} /> AI Research Engine</h2>
      <p className="muted">
        Ask about any low-cost marketing topic. The AI researches trusted sources (SBA, FTC, SCORE, HBR and more), then writes an
        <b> original</b> lesson with citations. Every lesson passes an automatic plagiarism check before you see it.
      </p>
      <ErrorBox error={error} />
      {busy ? (
        <div className="loading-orbit" role="status">
          <IconTile name="search" tone="teal" size={56} className="rocket" />
          <b>{RESEARCH_STEPS[step]}</b>
          <span className="muted small">This takes about a minute.</span>
        </div>
      ) : (
        <form onSubmit={run}>
          <div className="field">
            <label htmlFor="topic">Topic</label>
            <input id="topic" type="text" value={topic} maxLength={160} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. How to use flyers that people actually keep" />
          </div>
          <div className="row" style={{ marginBottom: 14 }}>
            {ideas.map((i) => (
              <button type="button" key={i} className="chip" style={{ cursor: 'pointer' }} onClick={() => setTopic(i)}>{i}</button>
            ))}
          </div>
          {user.role === 'admin' && (
            <div className="field">
              <label htmlFor="aud">Write for</label>
              <select id="aud" value={audience} onChange={(e) => setAudience(e.target.value)}>
                <option value="kid">Kid Entrepreneurs</option>
                <option value="adult">Adult Business Owners</option>
                <option value="professional">Professionals</option>
              </select>
            </div>
          )}
          <button className="btn btn-primary" disabled={topic.trim().length < 4}>Research & write lesson</button>
        </form>
      )}
    </section>
  );
}

function MonthPlan({ lessons }) {
  const plan = useMemo(() => buildPlan(lessons), [lessons]);
  const kid = useAuth((s) => s.user?.role === 'kid');
  const lessonLink = (l) => (kid ? `/app/learn/${l.id}/cards` : `/app/learn/${l.id}`);
  const [open, setOpen] = useState(() => plan.next ? plan.weeks.find((w) => w.days.includes(plan.next))?.week ?? 1 : 0);
  if (plan.total === 0) return null;
  const pct = Math.round((plan.done / plan.total) * 100);
  return (
    <section className="card month-plan" aria-labelledby="month-plan-title">
      <div className="month-plan-head">
        <div>
          <h2 id="month-plan-title" style={{ margin: 0 }}>Your marketing month</h2>
          <p className="muted small" style={{ margin: '4px 0 0' }}>
            {plan.total} lessons in 5 themed weeks, about one a day. Go at your own pace.
          </p>
        </div>
        {plan.next ? (
          <div className="row" style={{ gap: 8 }}>
            <Link to={`/app/learn/${plan.next.lesson.id}/cards`} className="btn btn-primary">
              Day {plan.next.day}: swipe it
            </Link>
            <Link to={`/app/learn/${plan.next.lesson.id}`} className="btn">Read</Link>
            {plan.done > 0 && <Link to="/app/review" className="btn"><Icon name="review" size={16} /> Flashback</Link>}
          </div>
        ) : (
          <span className="chip chip-success">Month complete!</span>
        )}
      </div>
      <div className="row" style={{ alignItems: 'center', gap: 12, margin: '14px 0 6px' }}>
        <div className="progress" style={{ flex: 1 }} role="progressbar" aria-valuemin={0} aria-valuemax={plan.total} aria-valuenow={plan.done} aria-label="Month progress">
          <span style={{ width: `${pct}%` }} />
        </div>
        <b className="small">{plan.done}/{plan.total}</b>
      </div>
      {plan.next && <p className="small" style={{ margin: '0 0 10px' }}>Up next: <b>{plan.next.lesson.title}</b></p>}
      <div className="month-weeks">
        {plan.weeks.map((w) => {
          const wDone = w.days.filter((d) => d.lesson.completed).length;
          const isOpen = open === w.week;
          return (
            <div key={w.week} className={`month-week ${isOpen ? 'open' : ''}`}>
              <button type="button" className="month-week-btn" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? 0 : w.week)}>
                <span className="title-with-icon" style={{ gap: 10 }}><IconTile name={WEEK_ICONS[w.week - 1]} tone={TONE_ORDER[w.week - 1]} size={30} /> <span><b>Week {w.week}</b> · {w.theme}</span></span>
                <span className="muted small">{wDone}/{w.days.length} {wDone === w.days.length ? '✓' : ''}</span>
              </button>
              {isOpen && (
                <ol className="month-days">
                  {w.days.map((d) => (
                    <li key={d.day}>
                      <Link to={lessonLink(d.lesson)} className={`month-day ${d.lesson.completed ? 'done' : ''} ${plan.next === d ? 'next' : ''}`}>
                        <span className="month-day-num">{d.lesson.completed ? '✓' : d.day}</span>
                        <span className="month-day-title">{d.lesson.title}</span>
                        <span className="muted small month-day-min">{d.lesson.estimatedMinutes} min</span>
                      </Link>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function Library() {
  const kidView = useAuth((s) => s.user?.role === 'kid');
  const { data, error, loading, setData } = useApi('/lessons');
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');

  const lessons = useMemo(() => {
    const all = data?.lessons ?? [];
    if (filter === 'mine') return all.filter((l) => l.ownerId);
    if (filter === 'todo') return all.filter((l) => !l.completed);
    return all;
  }, [data, filter]);

  return (
    <div className="stack" style={{ '--gap': '22px' }}>
      <header>
        <h1>Learning Library</h1>
        <p className="muted">Original, well-researched lessons on marketing that costs little or nothing. Follow the month plan, or pick any lesson.</p>
      </header>
      <div className="tabs" role="tablist">
        {[['all', 'All'], ['todo', 'Not done yet'], ['mine', 'AI-researched']].map(([k, label]) => (
          <button key={k} role="tab" aria-selected={filter === k} className="tab" onClick={() => setFilter(k)}>{label}</button>
        ))}
      </div>
      <ErrorBox error={error} />
      {!loading && data?.lessons && <MonthPlan lessons={data.lessons} />}
      {loading ? (
        <div className="grid"><div className="skeleton" /><div className="skeleton" /><div className="skeleton" /></div>
      ) : (
        <div className="grid stagger">
          {lessons.map((l, li) => (
            <Link key={l.id} to={kidView ? `/app/learn/${l.id}/cards` : `/app/learn/${l.id}`} className="card interactive lesson-card" style={{ '--ia': TONES[TONE_ORDER[li % TONE_ORDER.length]][0], '--ib': TONES[TONE_ORDER[li % TONE_ORDER.length]][1] }}>
              <IconTile name={topicIcon(l.title, l.summary)} tone={TONE_ORDER[li % TONE_ORDER.length]} size={50} />
              <div className="row" style={{ margin: '14px 0 10px' }}>
                <span className="chip">{l.level}</span>
                <span className="chip">{l.estimatedMinutes} min</span>
                <span className="chip chip-success">{l.costLevel}</span>
                {kidView && <span className="chip">Swipe</span>}
                {l.completed && <span className="chip chip-brand">✓ Done</span>}
                {!l.published && <span className="chip">Private draft</span>}
              </div>
              <h3>{l.title}</h3>
              <p className="muted small" style={{ margin: 0 }}>{l.summary}</p>
            </Link>
          ))}
          {lessons.length === 0 && <p className="muted">Nothing here yet.</p>}
        </div>
      )}
      <ResearchEngine
        onCreated={(lesson) => {
          setData((d) => ({ lessons: [lesson, ...(d?.lessons ?? [])] }));
          navigate(`/app/learn/${lesson.id}`);
        }}
      />
    </div>
  );
}

export function LessonView() {
  const { id } = useParams();
  const { data, error, loading } = useApi(`/lessons/${id}`);
  const refresh = useAuth((s) => s.refresh);
  const celebrate = useUI((s) => s.celebrate);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);

  if (error) return <ErrorBox error={error} />;
  if (loading || !data) return <Loading />;
  const { lesson } = data;
  const quiz = lesson.quiz ?? [];

  async function submitQuiz() {
    setBusy(true);
    try {
      const r = await api.post(`/lessons/${lesson.id}/complete`, { answers: quiz.map((_, i) => answers[i] ?? -1) });
      setResult(r);
      celebrate({ badges: r.newBadges, xp: r.xpEarned, title: r.newBadges.length ? 'Lesson complete!' : undefined });
      announcePlay(r.play);
      refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <article className="two-col">
      <div className="stack" style={{ '--gap': '18px' }}>
        <Link to="/app/learn" className="muted small">← Library</Link>
        <header>
          <div className="row" style={{ marginBottom: 10 }}>
            <span className="chip">{lesson.level}</span>
            <span className="chip">{lesson.estimatedMinutes} min</span>
            <span className="chip chip-success">{lesson.costLevel}</span>
          </div>
          <h1>{lesson.title}</h1>
          <p className="muted" style={{ fontSize: '1.1rem' }}>{lesson.summary}</p>
          <div className="row">
            <Link className="btn btn-primary" to={`/app/learn/${lesson.id}/cards`}>Swipe version (~{Math.max(2, Math.round(lesson.estimatedMinutes * 0.4))} min)</Link>
            <span className="small muted">Short cards, quiz taps and read-aloud. Same lesson, faster.</span>
          </div>
        </header>
        <div className="card prose">
          {lesson.sections.map((s, i) => (
            <section key={i}>
              <h3>{s.heading}</h3>
              <MiniMarkdown text={s.body} />
              {s.sourceRefs?.length > 0 && (
                <p className="small muted">
                  Sources:{' '}
                  {s.sourceRefs.map((r) => (
                    <a key={r} href={`#src-${r}`} style={{ marginRight: 6 }}>[{r + 1}]</a>
                  ))}
                </p>
              )}
            </section>
          ))}
        </div>

        {(lesson.scenario || LESSON_TOOLS[lesson.slug]) && (
          <div className="card practice-card">
            <h2 className="title-with-icon"><IconTile name="compass" tone="green" size={40} /> Practise it</h2>
            {lesson.scenario && (<><h3>What would you do?</h3><ScenarioBlock lessonId={lesson.id} scenario={lesson.scenario} /></>)}
            {LESSON_TOOLS[lesson.slug] && (<><h3 style={{ marginTop: 22 }}>Try it live: {TOOL_TITLES[LESSON_TOOLS[lesson.slug]]}</h3><LiveTool kind={LESSON_TOOLS[lesson.slug]} /></>)}
          </div>
        )}

        {quiz.length > 0 && (
          <div className="card">
            <h2>Quick check</h2>
            {quiz.map((q, qi) => (
              <fieldset key={qi} style={{ border: 0, padding: 0, margin: '0 0 18px' }}>
                <legend style={{ fontWeight: 700, marginBottom: 8 }}>{qi + 1}. {q.question}</legend>
                <div className="segmented">
                  {q.options.map((opt, oi) => {
                    const r = result?.results?.[qi];
                    const mark = r ? (oi === r.answerIndex ? ' ✅' : answers[qi] === oi ? ' ❌' : '') : '';
                    return (
                      <button type="button" key={oi} className="choice" aria-pressed={answers[qi] === oi} disabled={!!result} onClick={() => setAnswers({ ...answers, [qi]: oi })}>
                        {opt}{mark}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            ))}
            {result ? (
              <div className="alert alert-success">You got {result.correct}/{result.total}! {result.xpEarned ? `+${result.xpEarned} XP` : '(Already completed — no extra XP.)'}</div>
            ) : (
              <button className="btn btn-primary" onClick={submitQuiz} disabled={busy || Object.keys(answers).length < quiz.length}>
                {data.completed ? 'Check answers' : 'Finish lesson'}
              </button>
            )}
          </div>
        )}
      </div>

      <aside className="stack" style={{ '--gap': '18px' }}>
        <div className="card">
          <h3 className="title-with-icon"><IconTile name="target" tone="pink" size={32} /> Key takeaways</h3>
          <ul style={{ paddingLeft: '1.2em', lineHeight: 1.7 }}>{lesson.keyTakeaways.map((t, i) => <li key={i}>{t}</li>)}</ul>
        </div>
        <div className="card">
          <h3 className="title-with-icon"><IconTile name="tool" tone="orange" size={32} /> Try this week</h3>
          <ol className="checklist">{lesson.actionSteps.map((t, i) => <li key={i}><span aria-hidden>☐</span>{t}</li>)}</ol>
        </div>
        <div className="card">
          <h3 className="title-with-icon"><IconTile name="checklist" tone="blue" size={32} /> Sources & attribution</h3>
          <p className="small muted">
            This lesson is original writing that explains ideas from the sources below in our own words. Visit them for the full details.
          </p>
          <ol style={{ paddingLeft: '1.3em' }} className="small">
            {lesson.sources.map((s, i) => (
              <li key={i} id={`src-${i}`} style={{ marginBottom: 6 }}>
                <a href={s.url} target="_blank" rel="noopener noreferrer">{s.title || s.url}</a>
              </li>
            ))}
          </ol>
          {lesson.originality && (
            <div className="row small">
              <span className={`chip ${lesson.originality.passed ? 'chip-success' : 'chip-danger'}`}>
                {lesson.originality.passed ? '✓ Originality check passed' : '⚠ Needs review'}
              </span>
              <span className="muted">{lesson.generatedBy === 'ai' ? 'AI-researched' : 'Written by staff'}</span>
            </div>
          )}
        </div>
      </aside>
    </article>
  );
}
