// "Today" on the home page: streak, one daily mission, and the next thing to do.
// Kids get a big, colourful tile hub; grown-ups get a compact strip.
import { Link } from 'react-router-dom';
import { useApi } from '../lib/useApi.js';
import { IconTile } from './Icon.jsx';

export default function TodayPanel({ kid }) {
  const { data } = useApi('/play/today');
  if (!data) return <div className="skeleton" style={{ height: kid ? 260 : 120 }} />;
  const { streak, mission, level, course } = data;
  const cur = course?.current;
  const pct = Math.min(100, Math.round((level.into / level.span) * 100));

  const streakText = streak.count === 0
    ? (kid ? 'Start a streak today!' : 'Start a streak today')
    : `${streak.count}-day streak${streak.activeToday ? '' : ' · keep it alive today'}`;

  if (!kid) {
    return (
      <section className="today today-grown" aria-label="Today">
        <div className="today-cell">
          <IconTile name={streak.count > 0 ? 'flame' : 'leaf'} tone={streak.count > 0 ? 'orange' : 'green'} size={44} />
          <div><b>{streakText}</b><div className="small muted">Best: {streak.best} days</div></div>
        </div>
        <Link to={mission.to} className={`today-cell today-mission ${mission.done ? 'done' : ''}`}>
          <IconTile name={mission.done ? 'check' : mission.icon} tone={mission.done ? 'green' : mission.tone} size={44} />
          <div><b>{mission.done ? 'Today\'s mission done' : mission.title}</b><div className="small muted">Daily mission · +{mission.xp} XP</div></div>
        </Link>
        <Link to="/app/course" className="today-cell today-mission">
          <IconTile name="map" tone="violet" size={44} />
          <div style={{ minWidth: 0 }}>
            {cur ? (
              <><b className="clamp-1">Day {cur.day} of {course.total}: {cur.title}</b><div className="small muted">Today's session · about {cur.minutes} min</div></>
            ) : (
              <><b>{course?.finished ? 'Course complete!' : 'Today\'s session is done'}</b><div className="small muted">{course?.finished ? 'Great work' : 'Next day unlocks tomorrow'}</div></>
            )}
          </div>
        </Link>
        <div className="today-cell">
          <IconTile name="crown" tone="amber" size={44} />
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
          <IconTile name={streak.count > 0 ? 'flame' : 'leaf'} tone={streak.count > 0 ? 'amber' : 'green'} size={30} style={{ boxShadow: 'none', background: 'rgb(255 255 255 / 0.22)' }} />
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
        <IconTile name={mission.done ? 'trophy' : mission.icon} tone={mission.done ? 'amber' : mission.tone} size={52} style={{ boxShadow: '0 0 0 3px rgb(255 255 255 / 0.35)' }} />
        <div>
          <span className="small">Today's mission</span>
          <b>{mission.done ? 'Done! See you tomorrow 👋' : mission.title}</b>
        </div>
        {!mission.done && <span className="mission-xp">+{mission.xp} XP</span>}
      </Link>

      <div className="kid-tiles">
        <Link to="/app/course" className="kid-tile" style={{ '--t1': '#7c5cff', '--t2': '#2bd2ff' }}>
          <IconTile name="map" tone="violet" size={50} className="kid-tile-icon" /><b>Today's adventure</b><small>{cur ? `Day ${cur.day} · ${cur.minutes} min` : course?.finished ? 'All done!' : 'Done today! Back tomorrow'}</small>
        </Link>
        <Link to="/app/ideas" className="kid-tile" style={{ '--t1': '#ff9f1c', '--t2': '#ff5f8f' }}>
          <IconTile name="ideas" tone="amber" size={50} className="kid-tile-icon" /><b>My Idea Board</b><small>{data.ideas ? `${data.ideas} idea${data.ideas === 1 ? '' : 's'}` : 'Dream it up'}</small>
        </Link>
        <Link to="/app/studio" className="kid-tile" style={{ '--t1': '#00c9a7', '--t2': '#3d7bff' }}>
          <IconTile name="interviews" tone="teal" size={50} className="kid-tile-icon" /><b>Pitch Studio</b><small>Film & get tips</small>
        </Link>
        <Link to="/app/showcase" className="kid-tile" style={{ '--t1': '#ff5f8f', '--t2': '#8b5cf6' }}>
          <IconTile name="medal" tone="pink" size={50} className="kid-tile-icon" /><b>Showcase</b><small>Win a medal at 1,000 views</small>
        </Link>
      </div>
    </section>
  );
}
