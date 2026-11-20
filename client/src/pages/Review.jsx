// Daily Flashback: 3 quick questions from lessons you finished earlier (spaced retrieval practice).
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApi } from '../lib/useApi.js';
import { api } from '../lib/api.js';
import { ErrorBox, Loading } from '../components/common.jsx';
import { IconTile } from '../components/Icon.jsx';
import { QuizBlock } from '../components/Practice.jsx';
import { useUI } from '../store/ui.js';
import { useAuth } from '../store/auth.js';
import { announcePlay } from '../lib/play.js';

export default function Review() {
  const { data, error, loading } = useApi('/play/review');
  const [answers, setAnswers] = useState({});
  const [finished, setFinished] = useState(false);
  const celebrate = useUI((s) => s.celebrate);
  const refresh = useAuth((s) => s.refresh);

  if (error) return <ErrorBox error={error} />;
  if (loading || !data) return <Loading />;
  const qs = data.questions;
  const answered = Object.keys(answers).length;
  const correct = Object.values(answers).filter(Boolean).length;

  async function finish() {
    const r = await api.post('/play/review/done');
    setFinished(true);
    celebrate({ badges: r.newBadges ?? [], xp: r.xpEarned, title: r.newBadges?.length ? 'Memory Master!' : undefined });
    announcePlay(r.play);
    refresh();
  }

  return (
    <div className="stack" style={{ '--gap': '20px', maxWidth: 760 }}>
      <header className="title-with-icon">
        <IconTile name="review" tone="teal" size={56} />
        <div>
          <h1 style={{ margin: 0 }}>Daily Flashback</h1>
          <p className="muted" style={{ margin: 0 }}>Three quick questions from lessons you've already finished. Remembering things a few days later is what makes them stick.</p>
        </div>
      </header>

      {qs.length === 0 ? (
        <div className="card" style={{ textAlign: 'center' }}>
          <IconTile name="learn" tone="violet" size={56} style={{ margin: '0 auto 10px' }} />
          <h2>Nothing to review yet</h2>
          <p className="muted">Finish a lesson first, then come back tomorrow for your Flashback.</p>
          <Link className="btn btn-primary" to="/app/learn">Go to lessons</Link>
        </div>
      ) : (
        <>
          {qs.map((q, i) => (
            <div key={`${q.lessonId}-${q.index}`} className="card flashback-card">
              <span className="chip">{i + 1}/{qs.length} · from "{q.lessonTitle}"</span>
              <QuizBlock lessonId={q.lessonId} index={q.index} question={q.question} options={q.options} onAnswer={(_, ok) => setAnswers((a) => ({ ...a, [i]: ok }))} />
            </div>
          ))}
          <div className="card row spread">
            <b>{answered < qs.length ? `${answered}/${qs.length} answered` : `${correct}/${qs.length} remembered`}</b>
            {data.doneToday || finished ? (
              <span className="chip chip-success">Done for today. See you tomorrow!</span>
            ) : (
              <button type="button" className="btn btn-primary" disabled={answered < qs.length} onClick={finish}>Finish Flashback (+10 XP)</button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
