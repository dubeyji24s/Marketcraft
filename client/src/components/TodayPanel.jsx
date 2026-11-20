// "Today" on the home page: streak, one daily mission, and the next thing to do.
// Kids get a big, colourful tile hub; grown-ups get a compact strip.
import { Link } from 'react-router-dom';
import { useApi } from '../lib/useApi.js';

export default function TodayPanel({ kid }) {
  const { data } = useApi('/play/today');
  if (!data) return <div className="skeleton" style={{ height: kid ? 260 : 120 }} />;
  const { streak, mission, nextLesson, level } = data;
  const pct = Math.min(100, Math.round((level.into / level.span) * 100));
  const flame = streak.count > 0 ? '🔥' : '🌱';

  const streakText = streak.count === 0
    ? (kid ? 'Start a streak today!' : 'Start a streak today')
    : `${streak.count}-day streak${streak.activeToday ? '' : ' · keep it alive today'}`;

  if (!kid) {
    return (
      <section className="today today-grown" aria-label="Today">
        <div className="today-cell">
          <span className="today-big" aria-hidden>{flame}</span>
          <div><b>{streakText}</b><div className="small muted">Best: {streak.best} days</div></div>
        </div>
        <Link to={mission.to} className={`today-cell today-mission ${mission.done ? 'done' : ''}`}>
          <span className="today-big" aria-hidden>{mission.done ? '✅' : mission.emoji}</span>
          <div><b>{mission.done ? 'Today\'s mission done' : mission.title}</b><div className="small muted">Daily mission · +{mission.xp} XP</div></div>
        </Link>
        {nextLesson && (
          <div className="today-cell">
            <span className="today-big" aria-hidden>📱</span>
            <div style={{ minWidth: 0 }}>
              <b className="clamp-1">Day {nextLesson.day}: {nextLesson.title}</b>
              <div className="row small" style={{ gap: 10, marginTop: 4 }}>
                <Link to={`/app/learn/${nextLesson.id}/cards`}>⚡ 3-min swipe</Link>
                <Link to={`/app/learn/${nextLesson.id}`}>📖 Full read ({nextLesson.estimatedMinutes} min)</Link>
              </div>
            </div>
          </div>
        )}
        <div className="today-cell">
          <span className="today-big" aria-hidden>🏅</span>
          <div style={{ flex: 1 }}>
            <b>Level {level.level} · {level.title}</b>
            <div className="progress" style={{ marginTop: 6 }}><span style={{ width: `${pct}%` }} /></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="today today-kid" aria-label="Today">
      <div className="today-kid-head">
        <div className={`streak-badge ${streak.count > 0 ? 'lit' : ''}`}>
          <span aria-hidden>{flame}</span>
          <b>{streak.count}</b>
          <span className="small">day{streak.count === 1 ? '' : 's'}</span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <b>{streakText}</b>
          <div className="small">Level {level.level}: <b>{level.title}</b></div>
          <div className="progress" style={{ marginTop: 6 }}><span style={{ width: `${pct}%` }} /></div>
        </div>
      </div>

      <Link to={mission.to} className={`mission-card ${mission.done ? 'done' : ''}`}>
        <span className="mission-emoji" aria-hidden>{mission.done ? '🏆' : mission.emoji}</span>
        <div>
          <span className="small">Today's mission</span>
          <b>{mission.done ? 'Done! See you tomorrow 👋' : mission.title}</b>
        </div>
        {!mission.done && <span className="mission-xp">+{mission.xp} XP</span>}
      </Link>

      <div className="kid-tiles">
        <Link to={nextLesson ? `/app/learn/${nextLesson.id}/cards` : '/app/learn'} className="kid-tile" style={{ '--t1': '#7c5cff', '--t2': '#2bd2ff' }}>
          <span aria-hidden>📱</span><b>Swipe & learn</b><small>{nextLesson ? `Day ${nextLesson.day}` : 'All done!'}</small>
        </Link>
        <Link to="/app/ideas" className="kid-tile" style={{ '--t1': '#ff9f1c', '--t2': '#ff5f8f' }}>
          <span aria-hidden>💡</span><b>My Idea Board</b><small>{data.ideas ? `${data.ideas} idea${data.ideas === 1 ? '' : 's'}` : 'Dream it up'}</small>
        </Link>
        <Link to="/app/studio" className="kid-tile" style={{ '--t1': '#00c9a7', '--t2': '#3d7bff' }}>
          <span aria-hidden>🎤</span><b>Pitch Studio</b><small>Film & get tips</small>
        </Link>
        <Link to="/app/showcase" className="kid-tile" style={{ '--t1': '#ff5f8f', '--t2': '#8b5cf6' }}>
          <span aria-hidden>🎥</span><b>Showcase</b><small>🥇 Medal at 1,000 views</small>
        </Link>
      </div>
    </section>
  );
}
