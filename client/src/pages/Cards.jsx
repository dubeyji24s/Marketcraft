// Swipe lessons: a full-screen, vertical card feed made from any lesson.
// Swipe (or scroll / arrow keys) to move; tap quiz answers; finish to save progress.
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useApi } from '../lib/useApi.js';
import { api } from '../lib/api.js';
import { ErrorBox, Loading } from '../components/common.jsx';
import { useAuth } from '../store/auth.js';
import { useUI } from '../store/ui.js';
import { buildDeck, cardGradient, speakText } from '../lib/cards.js';
import { announcePlay, speech } from '../lib/play.js';

const READ_KEY = 'mc-read-aloud';

export default function Cards() {
  const { id } = useParams();
  const { data, error, loading } = useApi(`/lessons/${id}`);
  const user = useAuth((s) => s.user);
  const refresh = useAuth((s) => s.refresh);
  const celebrate = useUI((s) => s.celebrate);
  const navigate = useNavigate();
  const kid = user?.role === 'kid';

  const deck = useMemo(() => (data ? buildDeck(data.lesson, { kid }) : []), [data, kid]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [open, setOpen] = useState({});
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [readAloud, setReadAloud] = useState(() => {
    try { return localStorage.getItem(READ_KEY) === '1'; } catch { return false; }
  });
  const feed = useRef(null);

  // which card is on screen
  useEffect(() => {
    const root = feed.current;
    if (!root) return undefined;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setIndex(Number(e.target.dataset.i))),
      { root, threshold: 0.6 },
    );
    root.querySelectorAll('[data-i]').forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [deck.length]);

  // read the current card aloud when turned on
  useEffect(() => {
    if (readAloud && deck[index]) speech.say(speakText(deck[index]), { rate: kid ? 0.92 : 1 });
    return () => speech.stop();
  }, [index, readAloud, deck, kid]);

  // keyboard: ↓/space next, ↑ previous, Esc close
  useEffect(() => {
    const onKey = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
      if (e.key === 'ArrowDown' || e.key === 'PageDown' || (e.key === ' ' && e.target.tagName !== 'BUTTON')) { e.preventDefault(); go(index + 1); }
      if (e.key === 'ArrowUp' || e.key === 'PageUp') { e.preventDefault(); go(index - 1); }
      if (e.key === 'Escape') navigate(`/app/learn/${id}`);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  // the feed is full screen: stop the page behind it from scrolling
  useEffect(() => {
    document.body.classList.add('no-scroll');
    return () => document.body.classList.remove('no-scroll');
  }, []);

  function go(i) {
    const el = feed.current?.querySelector(`[data-i="${Math.max(0, Math.min(deck.length - 1, i))}"]`);
    el?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }
  function toggleRead() {
    const v = !readAloud;
    setReadAloud(v);
    if (!v) speech.stop();
    try { localStorage.setItem(READ_KEY, v ? '1' : '0'); } catch { /* ignore */ }
  }

  async function finish() {
    setBusy(true);
    try {
      const quiz = data.lesson.quiz ?? [];
      const q = await api.post(`/lessons/${id}/complete`, { answers: quiz.map((_, i) => answers[i] ?? -1) });
      const c = await api.post(`/play/cards/${id}`);
      setResult(q);
      const badges = [...(q.newBadges ?? []), ...(c.newBadges ?? [])];
      celebrate({ badges, xp: (q.xpEarned ?? 0) + (c.xpEarned ?? 0), title: badges.length ? 'Lesson complete!' : undefined });
      announcePlay(c.play);
      refresh();
    } catch (e) {
      useUI.getState().toast(e.message, 'error');
    } finally {
      setBusy(false);
    }
  }

  if (error) return <ErrorBox error={error} />;
  if (loading || !data) return <Loading />;

  const quizTotal = (data.lesson.quiz ?? []).length;
  return (
    <div className={`swipe ${kid ? 'swipe-kid' : ''}`} role="dialog" aria-modal="true" aria-label={`${data.lesson.title}: swipe lesson`}>
      <div className="swipe-top">
        <Link to={`/app/learn/${id}`} className="swipe-btn" aria-label="Close swipe lesson">✕</Link>
        <div className="swipe-bars" aria-hidden>
          {deck.map((_, i) => <span key={i} className={i <= index ? 'on' : ''} />)}
        </div>
        {speech.supported && (
          <button type="button" className={`swipe-btn ${readAloud ? 'on' : ''}`} onClick={toggleRead} aria-pressed={readAloud} title="Read to me">
            {readAloud ? '🔊' : '🔈'}<span className="sr-only">Read to me</span>
          </button>
        )}
      </div>
      <p className="sr-only" aria-live="polite">Card {index + 1} of {deck.length}</p>

      <div className="swipe-feed" ref={feed}>
        {deck.map((card, i) => {
          const [a, b] = cardGradient(i);
          return (
            <section key={i} data-i={i} className={`swipe-card swipe-${card.type}`} style={{ '--c1': a, '--c2': b }}>
              <div className="swipe-inner">
                {card.type === 'cover' && (
                  <>
                    <div className="swipe-emoji big" aria-hidden>{card.emoji}</div>
                    <h1>{card.title}</h1>
                    <p className="swipe-text">{card.text}</p>
                    <span className="swipe-chip">⏱ about {card.minutes} min · {deck.length} cards</span>
                  </>
                )}
                {card.type === 'idea' && (
                  <>
                    <div className="swipe-emoji" aria-hidden>{card.emoji}</div>
                    <span className="swipe-chip">{card.heading}{card.of > 1 ? ` · ${card.part}/${card.of}` : ''}</span>
                    {card.kind === 'list' ? (
                      <ul className="swipe-list">{card.items.map((t, k) => <li key={k}>{t}</li>)}</ul>
                    ) : (
                      <p className="swipe-text">{card.text}</p>
                    )}
                    {card.more?.length > 0 && (
                      open[i] ? (
                        <div className="swipe-more">
                          {card.more.map((m, k) => (m.kind === 'list' ? <ul key={k} className="swipe-list small">{m.items.map((t, j) => <li key={j}>{t}</li>)}</ul> : <p key={k}>{m.text}</p>))}
                        </div>
                      ) : (
                        <button type="button" className="swipe-pill" onClick={() => setOpen({ ...open, [i]: true })}>＋ Tell me more</button>
                      )
                    )}
                  </>
                )}
                {card.type === 'quiz' && (
                  <>
                    <div className="swipe-emoji" aria-hidden>🤔</div>
                    <span className="swipe-chip">Quick check {card.index + 1}/{quizTotal}</span>
                    <h2>{card.question}</h2>
                    <div className="swipe-options" role="radiogroup" aria-label={card.question}>
                      {card.options.map((opt, oi) => {
                        const r = result?.results?.[card.index];
                        const mark = r ? (oi === r.answerIndex ? ' ✅' : answers[card.index] === oi ? ' ❌' : '') : '';
                        return (
                          <button
                            key={oi}
                            type="button"
                            role="radio"
                            aria-checked={answers[card.index] === oi}
                            className={`swipe-option ${answers[card.index] === oi ? 'picked' : ''}`}
                            disabled={Boolean(result)}
                            onClick={() => { setAnswers({ ...answers, [card.index]: oi }); setTimeout(() => go(i + 1), 450); }}
                          >
                            {opt}{mark}
                          </button>
                        );
                      })}
                    </div>
                    {answers[card.index] != null && !result && <p className="swipe-hint">Answer saved! You'll see your score at the end ✨</p>}
                  </>
                )}
                {card.type === 'recap' && (
                  <>
                    <div className="swipe-emoji" aria-hidden>🧠</div>
                    <h2>Remember this</h2>
                    <ul className="swipe-list">{card.items.map((t, k) => <li key={k}>{t}</li>)}</ul>
                  </>
                )}
                {card.type === 'try' && (
                  <>
                    <div className="swipe-emoji" aria-hidden>🚀</div>
                    <h2>{kid ? 'Your mission' : 'Try it this week'}</h2>
                    <ol className="swipe-list">{card.items.map((t, k) => <li key={k}>{t}</li>)}</ol>
                    <Link className="swipe-pill" to="/app/ideas">💡 Use it on my {kid ? 'Idea Board' : 'Business Canvas'}</Link>
                  </>
                )}
                {card.type === 'finish' && (
                  <>
                    <div className="swipe-emoji big" aria-hidden>{result ? '🎉' : '🏁'}</div>
                    {!result ? (
                      <>
                        <h2>{kid ? 'You made it to the end!' : 'Nice work — that\'s the lesson.'}</h2>
                        <p className="swipe-text">
                          {quizTotal ? `You answered ${Object.keys(answers).length} of ${quizTotal} questions.` : ''} Tap below to save your progress.
                        </p>
                        <button type="button" className="btn btn-primary btn-lg" onClick={finish} disabled={busy}>
                          {busy ? 'Saving…' : 'Finish & see my score'}
                        </button>
                      </>
                    ) : (
                      <>
                        <h2>{result.total ? `${result.correct}/${result.total} correct` : 'Lesson complete!'}</h2>
                        <p className="swipe-text">{result.correct === result.total ? 'Perfect! 🌟' : 'Swipe back up to see the right answers ✅'}</p>
                        <div className="row" style={{ justifyContent: 'center' }}>
                          <Link className="btn btn-primary" to="/app/learn">Next lesson →</Link>
                          <Link className="btn" to="/app">Home</Link>
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
              {i < deck.length - 1 && i === index && <button type="button" className="swipe-next" onClick={() => go(i + 1)} aria-label="Next card">⌄</button>}
            </section>
          );
        })}
      </div>
    </div>
  );
}
