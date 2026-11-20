// My Course: the learner's personalised day-by-day path. Today's session has five short steps;
// a new day unlocks each day, so the course is a calm daily habit rather than a binge.
import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useApi } from '../lib/useApi.js';
import { api } from '../lib/api.js';
import { ErrorBox, Loading } from '../components/common.jsx';
import { Icon, IconTile, TONE_ORDER } from '../components/Icon.jsx';
import { useAuth } from '../store/auth.js';
import { useUI } from '../store/ui.js';
import { announcePlay } from '../lib/play.js';

const FORMAT_TEXT = { shorts: 'Shorts first', swipe: 'Swipe cards', read: 'In-depth reading' };
const TRACK_TEXT = { kid: 'Kid Entrepreneur track', owner: 'Business Owner track', pro: 'Professional track' };

export default function Course() {
  const user = useAuth((s) => s.user);
  const refresh = useAuth((s) => s.refresh);
  const { data, error, loading, setData } = useApi('/play/course');
  const [openWeek, setOpenWeek] = useState(null);
  if (user && !user.personal && user.role !== 'admin') return <Navigate to="/app/personalize" replace />;
  if (error) return <ErrorBox error={error} />;
  if (loading || !data) return <Loading />;
  const c = data.course;
  const today = c.current;
  const kid = c.profile.track === 'kid';
  const pct = Math.round((c.done / c.total) * 100);
  const weeks = [...new Set(c.days.map((d) => d.week))];
  const shownWeek = openWeek ?? today?.week ?? c.days.find((d) => !d.doneAt)?.week ?? weeks[weeks.length - 1];

  async function mark(step) {
    try {
      const r = await api.post(`/play/course/${today.day}/step`, { step });
      setData({ course: r.course });
      if (r.dayFinished) useUI.getState().celebrate({ badges: r.newBadges ?? [], xp: r.xpEarned, title: `Day ${today.day} complete!` });
      announcePlay(r.play);
      refresh();
    } catch (e) {
      useUI.getState().toast(e.message, 'error');
    }
  }

  const steps = today && [
    { id: 'short', icon: 'studio', tone: 'pink', title: kid ? 'Watch today\'s short' : 'Watch the short', time: '~1–2 min', done: today.steps.short, to: `/app/learn/${today.lessonId}/short?day=${today.day}&p=${encodeURIComponent(today.project.text)}`, cta: 'Play' },
    { id: 'lesson', icon: 'phone', tone: 'violet', title: c.profile.format === 'read' ? 'Read the lesson + quiz' : 'Swipe the lesson + quiz', time: c.profile.format === 'read' ? 'in depth' : '~4–6 min', done: today.steps.lesson, to: c.profile.format === 'read' ? `/app/learn/${today.lessonId}` : `/app/learn/${today.lessonId}/cards`, cta: 'Start', alt: c.profile.format === 'read' ? { to: `/app/learn/${today.lessonId}/cards`, label: 'Swipe instead' } : { to: `/app/learn/${today.lessonId}`, label: 'Read instead' } },
    { id: 'decide', icon: 'compass', tone: 'green', title: 'Make the real-world decision', time: '~2 min', done: today.steps.decide, to: `/app/learn/${today.lessonId}/cards`, cta: 'Decide', note: 'Inside the swipe lesson' },
    { id: 'review', icon: 'review', tone: 'teal', title: 'Daily Flashback (bonus)', time: '~2 min', done: today.steps.review, to: '/app/review', cta: 'Play', optional: true },
    { id: 'project', icon: 'tool', tone: 'orange', title: kid ? 'Your mission' : 'Do it: today\'s project', time: c.profile.minutes >= 30 ? '~10–15 min' : '~5 min', done: today.steps.project, text: today.project.text, to: today.project.to, cta: 'Open', manual: true },
  ];

  return (
    <div className="stack" style={{ '--gap': '22px' }}>
      <header className="course-head card">
        <div className="title-with-icon">
          <IconTile name="map" tone="violet" size={56} />
          <div>
            <h1 style={{ margin: 0 }}>{kid ? 'My Marketcraft Adventure' : 'My Course'}</h1>
            <p className="muted" style={{ margin: 0 }}>{TRACK_TEXT[c.profile.track]} · {FORMAT_TEXT[c.profile.format]} · {c.profile.minutes} min a day</p>
          </div>
        </div>
        <div className="course-progress">
          <div className="row spread small"><b>Day {Math.min(c.done + 1, c.total)} of {c.total}</b><span>{pct}%</span></div>
          <div className="progress"><span style={{ width: `${pct}%` }} /></div>
        </div>
        <div className="row" style={{ gap: 8 }}>
          <Link className="btn btn-sm" to="/app/personalize"><Icon name="wand" size={14} /> Retake the test</Link>
          <Link className="btn btn-sm" to="/app/learn"><Icon name="learn" size={14} /> Browse the library</Link>
        </div>
      </header>

      {c.finished ? (
        <section className="card today-session" style={{ textAlign: 'center' }}>
          <IconTile name="grad" tone="amber" size={84} style={{ margin: '0 auto 10px' }} />
          <h2>You finished the whole course!</h2>
          <p className="muted">Keep your streak with the daily Flashback, build your ideas, and share your best work in the Showcase.</p>
        </section>
      ) : today ? (
        <section className="card today-session" aria-labelledby="today-title">
          <div className="row spread">
            <div>
              <span className="chip chip-brand">Day {today.day} · Week {today.week}: {today.theme}</span>
              <h2 id="today-title" style={{ margin: '10px 0 2px' }}>{today.title}</h2>
              <p className="muted small" style={{ margin: 0 }}>About {today.minutes} minutes{today.quick ? ' · quick review for you (you know the basics)' : ''}{today.focus ? ' · picked for your goals' : ''}</p>
            </div>
          </div>
          <ol className="session-steps">
            {steps.map((st, k) => (
              <li key={st.id} className={`session-step ${st.done ? 'done' : ''}`}>
                <IconTile name={st.done ? 'check' : st.icon} tone={st.done ? 'green' : st.tone} size={46} />
                <div className="session-body">
                  <b>{k + 1}. {st.title}{st.optional ? '' : ''}</b>
                  <span className="small muted">{st.time}{st.note ? ` · ${st.note}` : ''}</span>
                  {st.text && <p className="session-project">{st.text}</p>}
                </div>
                <div className="session-actions">
                  {st.to && !st.done && <Link className="btn btn-sm btn-primary" to={st.to}>{st.cta}</Link>}
                  {st.alt && !st.done && <Link className="btn btn-sm btn-ghost" to={st.alt.to}>{st.alt.label}</Link>}
                  {st.manual && !st.done && <button type="button" className="btn btn-sm" onClick={() => mark(st.id)}><Icon name="check" size={14} /> I did it</button>}
                  {st.done && <span className="chip chip-success">Done</span>}
                </div>
              </li>
            ))}
          </ol>
        </section>
      ) : (
        <section className="card today-session" style={{ textAlign: 'center' }}>
          <IconTile name="flame" tone="orange" size={72} style={{ margin: '0 auto 10px' }} />
          <h2>Today's session is done. Great work!</h2>
          <p className="muted">Day {c.done + 1} unlocks tomorrow. Want more today? Try the Flashback, your {kid ? 'Idea Board' : 'Business Canvas'}, or cheer someone in the Showcase.</p>
          <div className="row" style={{ justifyContent: 'center' }}>
            <Link className="btn" to="/app/review">Flashback</Link>
            <Link className="btn" to="/app/ideas">{kid ? 'Idea Board' : 'Business Canvas'}</Link>
            <Link className="btn" to="/app/showcase">Showcase</Link>
          </div>
        </section>
      )}

      <section className="card">
        <h2 className="title-with-icon"><IconTile name="calendar" tone="blue" size={36} /> Your path</h2>
        <div className="tabs" role="tablist" style={{ marginBottom: 14 }}>
          {weeks.map((w) => <button key={w} role="tab" className="tab" aria-selected={shownWeek === w} onClick={() => setOpenWeek(w)}>Week {w}</button>)}
        </div>
        <ol className="path">
          {c.days.filter((d) => d.week === shownWeek).map((d) => (
            <li key={d.day} className={`path-day ${d.doneAt ? 'done' : d.unlocked ? 'open' : 'locked'}`}>
              <span className="path-dot">{d.doneAt ? <Icon name="check" size={16} /> : d.unlocked ? d.day : <Icon name="lock" size={14} />}</span>
              <div>
                <b>Day {d.day}: {d.title}</b>
                <span className="small muted" style={{ display: 'block' }}>{d.doneAt ? 'Completed' : d.unlocked ? 'Today' : 'Unlocks one day after the previous day'}{d.focus ? ' · ★ your focus' : ''}</span>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
