import { Link, useNavigate } from 'react-router-dom';
import { useApi } from '../lib/useApi.js';
import { api } from '../lib/api.js';
import { ErrorBox, ROLE_INFO } from '../components/common.jsx';
import { useUI } from '../store/ui.js';

const GREETING = {
  kid: 'Ready to become a marketing superstar?',
  adult: 'Let\'s grow your business without blowing the budget.',
  professional: 'Sharpen your edge. Ship better campaigns.',
  admin: 'Manage content and keep the academy humming.',
};

export default function Dashboard() {
  const { data, error, loading } = useApi('/studio/dashboard');
  const navigate = useNavigate();
  const toast = useUI((s) => s.toast);

  if (error) return <ErrorBox error={error} />;
  if (loading || !data) return <div className="grid"><div className="skeleton" /><div className="skeleton" /><div className="skeleton" /></div>;

  const { user, level, stats, badgeCatalog } = data;
  const xpThisLevel = user.xp - 50 * (level - 1) ** 2;
  const xpForNext = 50 * level ** 2 - 50 * (level - 1) ** 2;
  const lessonPct = stats.lessonsTotal ? Math.round((stats.lessonsCompleted / stats.lessonsTotal) * 100) : 0;

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
      <section className="card hero-card">
        <div className="row spread">
          <div>
            <div className="small" style={{ fontWeight: 700, opacity: 0.8 }}>{ROLE_INFO[user.role]?.emoji} {user.roleLabel}</div>
            <h1 style={{ margin: '6px 0' }}>Hey {user.name.split(' ')[0]}!</h1>
            <p className="muted" style={{ margin: 0 }}>{GREETING[user.role]}</p>
          </div>
          <div style={{ minWidth: 220, flex: '0 1 280px' }}>
            <div className="row spread small" style={{ fontWeight: 700 }}>
              <span>Level {level}</span>
              <span>{user.xp} XP</span>
            </div>
            <div className="progress" style={{ marginTop: 6 }} aria-label={`Level progress ${xpThisLevel} of ${xpForNext}`}>
              <span style={{ width: `${Math.min(100, (xpThisLevel / xpForNext) * 100)}%` }} />
            </div>
            <div className="small muted" style={{ marginTop: 4 }}>{xpForNext - xpThisLevel} XP to level {level + 1}</div>
          </div>
        </div>
      </section>

      <section className="grid stagger" style={{ '--min': '170px' }}>
        <div className="card stat"><span className="muted small">Lessons</span><b>{stats.lessonsCompleted}/{stats.lessonsTotal}</b><div className="progress"><span style={{ width: `${lessonPct}%` }} /></div></div>
        <div className="card stat"><span className="muted small">Pitches submitted</span><b>{stats.submissions}</b></div>
        <div className="card stat"><span className="muted small">Best score</span><b>{stats.bestScore}%</b></div>
        <div className="card stat"><span className="muted small">Certificates</span><b>{stats.certificates}</b></div>
      </section>

      <section className="two-col">
        <div className="card card-accent">
          <h2>Your next mission</h2>
          <ol className="checklist" style={{ marginBottom: 18 }}>
            <li><span aria-hidden>{stats.lessonsCompleted > 0 ? '✅' : '1️⃣'}</span> <span>Learn the basics in the <Link to="/app/learn">Library</Link></span></li>
            <li><span aria-hidden>2️⃣</span> <span>Watch an <Link to="/app/interviews">owner interview</Link> for real-world ideas</span></li>
            <li><span aria-hidden>{stats.submissions > 0 ? '✅' : '3️⃣'}</span> <span>Plan & film your pitch in the <Link to="/app/studio">Studio</Link></span></li>
            <li><span aria-hidden>{stats.certificates > 0 ? '✅' : '4️⃣'}</span> <span>Score {'≥'} {data.passThreshold}% (professional level) to earn your certificate</span></li>
            <li><span aria-hidden>{user.ambassador ? '✅' : '5️⃣'}</span> <span>Become a <Link to="/app/ambassador">Brand Ambassador</Link> and use the AI marketing tools</span></li>
          </ol>
          <div className="row">
            <button className="btn btn-primary" onClick={assign}>🎲 Assign me a challenge</button>
            <Link className="btn" to="/app/learn">Continue learning</Link>
          </div>
        </div>
        <div className="card">
          <h2>Badges</h2>
          <div className="grid" style={{ '--min': '110px', gap: 10 }}>
            {Object.entries(badgeCatalog).map(([key, b]) => {
              const earned = user.badges.includes(key);
              return (
                <div key={key} className={`badge-tile ${earned ? 'earned' : 'locked'}`} title={b.description}>
                  <span className="emoji" aria-hidden>{b.emoji}</span>
                  <b className="small">{b.label}</b>
                  <span className="sr-only">{earned ? 'earned' : 'locked'}: {b.description}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
