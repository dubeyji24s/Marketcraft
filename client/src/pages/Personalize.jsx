// Quick personalisation test: 5–6 tap-to-answer questions (different for kids, owners and pros),
// then a personal course plan built from the answers.
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QUIZ, trackFor, profileFromAnswers, TOPICS } from '@course';
import { api } from '../lib/api.js';
import { useAuth } from '../store/auth.js';
import { useUI } from '../store/ui.js';
import { Icon, IconTile, TONE_ORDER } from '../components/Icon.jsx';

const TRACK_INTRO = {
  kid: { title: 'Let\'s build YOUR course!', text: 'Answer 5 quick questions (about 1 minute) and we\'ll design a fun course just for you. A parent can help!' },
  owner: { title: 'Let\'s personalise your course', text: 'Six quick questions (about a minute) so your course fits your business, your goals and your time.' },
  pro: { title: 'Calibrate your course', text: 'Six quick questions (about a minute) to match your experience, focus areas and time budget.' },
};
const FORMAT_LABEL = { shorts: 'Shorts first', swipe: 'Swipe cards', read: 'In-depth reading' };
const LEVEL_LABEL = { starter: 'Beginner', growing: 'Intermediate', advanced: 'Advanced' };

export default function Personalize() {
  const user = useAuth((s) => s.user);
  const refresh = useAuth((s) => s.refresh);
  const navigate = useNavigate();
  const track = trackFor(user?.role);
  const quiz = QUIZ[track];
  const [step, setStep] = useState(-1); // -1 = intro, quiz.length = result
  const [answers, setAnswers] = useState(() => ({ ...(user?.personalAnswers ?? {}) }));
  const [busy, setBusy] = useState(false);
  const [course, setCourse] = useState(null);
  const intro = TRACK_INTRO[track];
  const preview = useMemo(() => profileFromAnswers(user?.role, answers), [answers, user?.role]);

  function choose(q, value) {
    if (q.multi) {
      const cur = answers[q.id] ?? [];
      const next = cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value].slice(-q.multi);
      setAnswers({ ...answers, [q.id]: next });
      return;
    }
    setAnswers({ ...answers, [q.id]: value });
    setTimeout(() => setStep((s) => s + 1), 280);
  }
  async function submit() {
    setBusy(true);
    try {
      const r = await api.put('/play/profile', { answers });
      setCourse(r.course);
      setStep(quiz.length);
      await refresh();
    } catch (e) {
      useUI.getState().toast(e.message, 'error');
    } finally {
      setBusy(false);
    }
  }

  const q = quiz[step];
  return (
    <div className="personalize">
      <div className="card personalize-card">
        {step === -1 && (
          <div className="personalize-intro">
            <IconTile name="compass" tone="violet" size={84} className="short-icon" />
            <h1>{intro.title}</h1>
            <p className="muted" style={{ fontSize: '1.1rem' }}>{intro.text}</p>
            <div className="personalize-perks">
              {[['map', 'A day-by-day plan'], ['studio', 'Shorts, cards & real decisions'], ['flame', '15–30 minutes a day']].map(([ic, t], k) => (
                <span key={t} className="hero-pill"><IconTile name={ic} tone={TONE_ORDER[k]} size={28} /> {t}</span>
              ))}
            </div>
            <button type="button" className="btn btn-primary btn-lg" onClick={() => setStep(0)}>Start the quick test →</button>
          </div>
        )}

        {q && (
          <div className="personalize-q" key={q.id}>
            <div className="personalize-progress" aria-hidden>{quiz.map((_, k) => <span key={k} className={k <= step ? 'on' : ''} />)}</div>
            <span className="small muted">Question {step + 1} of {quiz.length}</span>
            <h2>{q.q}</h2>
            <div className={`personalize-options ${q.options.length > 4 ? 'many' : ''}`} role={q.multi ? 'group' : 'radiogroup'} aria-label={q.q}>
              {q.options.map(([value, label, icon], k) => {
                const on = q.multi ? (answers[q.id] ?? []).includes(value) : answers[q.id] === value;
                return (
                  <button key={String(value)} type="button" role={q.multi ? 'checkbox' : 'radio'} aria-checked={on} className={`personalize-option ${on ? 'on' : ''}`} onClick={() => choose(q, value)}>
                    <IconTile name={icon} tone={TONE_ORDER[k % TONE_ORDER.length]} size={44} />
                    <b>{label}</b>
                    {on && <span className="personalize-tick"><Icon name="check" size={16} /></span>}
                  </button>
                );
              })}
            </div>
            <div className="row spread" style={{ marginTop: 18 }}>
              <button type="button" className="btn btn-ghost" onClick={() => setStep(step - 1)}>← Back</button>
              {q.multi && <button type="button" className="btn btn-primary" onClick={() => setStep(step + 1)}>{(answers[q.id] ?? []).length ? 'Next →' : 'Skip →'}</button>}
            </div>
          </div>
        )}

        {step === quiz.length && !course && (
          <div className="personalize-intro">
            <IconTile name="wand" tone="pink" size={84} className="short-icon" />
            <h1>Ready to build your course</h1>
            <ul className="personalize-summary">
              <li><b>Level:</b> {LEVEL_LABEL[preview.level]}</li>
              <li><b>Format:</b> {FORMAT_LABEL[preview.format]}</li>
              <li><b>Daily time:</b> {preview.minutes} minutes</li>
              {(preview.interests.length > 0 || preview.goalTopic) && <li><b>Focus:</b> {[...new Set([preview.goalTopic, ...preview.interests].filter(Boolean))].map((t) => TOPICS[t]?.label).join(', ')}</li>}
            </ul>
            <div className="row" style={{ justifyContent: 'center' }}>
              <button type="button" className="btn btn-ghost" onClick={() => setStep(0)}>Change answers</button>
              <button type="button" className="btn btn-primary btn-lg" disabled={busy} onClick={submit}>{busy ? <span className="spinner" /> : 'Build my course'}</button>
            </div>
          </div>
        )}

        {course && (
          <div className="personalize-intro">
            <IconTile name="trophy" tone="amber" size={84} className="short-icon" />
            <h1>Your {course.total}-day course is ready!</h1>
            <p className="muted" style={{ fontSize: '1.05rem' }}>
              One new day unlocks every day. Each session is about {course.current?.minutes ?? 20} minutes: a short, the lesson, a real decision, a quick Flashback and a project made for you.
            </p>
            <div className="personalize-week">
              {course.days.slice(0, 7).map((d, k) => (
                <div key={d.day} className="personalize-day">
                  <IconTile name="learn" tone={TONE_ORDER[k % TONE_ORDER.length]} size={34} />
                  <span><b>Day {d.day}</b> {d.title}{d.focus ? ' ★' : ''}</span>
                </div>
              ))}
            </div>
            <p className="small muted">★ = picked for your goals</p>
            <button type="button" className="btn btn-primary btn-lg" onClick={() => navigate('/app/course')}>Start Day 1 →</button>
          </div>
        )}
      </div>
    </div>
  );
}
