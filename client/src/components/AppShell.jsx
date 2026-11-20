import { useEffect, useState } from 'react';
import { NavLink, Outlet, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/auth.js';
import { useUI } from '../store/ui.js';
import { Loading, ROLE_INFO } from './common.jsx';
import { Brand, APP_NAME } from './Brand.jsx';

const NAV = [
  { to: '/app', label: 'Home', icon: '🏠', end: true },
  { to: '/app/learn', label: 'Learn', icon: '📚' },
  { to: '/app/ideas', label: 'Ideas', icon: '💡' },
  { to: '/app/interviews', label: 'Interviews', icon: '🎙️' },
  { to: '/app/studio', label: 'Studio', icon: '🎬' },
  { to: '/app/showcase', label: 'Showcase', icon: '🎥' },
  { to: '/app/certificates', label: 'Certificates', icon: '🏅' },
  { to: '/app/ambassador', label: 'Ambassador', icon: '🤝' },
  { to: '/app/lab', label: 'My Lab', icon: '🧪' },
];

export function usePublicTheme() {
  useEffect(() => {
    document.documentElement.dataset.theme = 'public';
  }, []);
}

function VerifyEmailBanner() {
  const { resendVerification, refreshVerification } = useAuth();
  const toast = useUI((s) => s.toast);
  const [busy, setBusy] = useState(false);
  async function run(fn, ok) {
    setBusy(true);
    try {
      const r = await fn();
      if (ok) toast(typeof ok === 'function' ? ok(r) : ok, 'success');
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="alert alert-info row spread small" role="status">
      <span>📧 Please verify your email address. We sent you a link when you signed up.</span>
      <span className="row">
        <button className="btn btn-sm" disabled={busy} onClick={() => run(resendVerification, 'Verification email sent!')}>Resend email</button>
        <button className="btn btn-sm btn-primary" disabled={busy} onClick={() => run(refreshVerification, (u) => (u.emailVerified ? 'Email verified. Thanks!' : 'Not verified yet. Click the link in the email first.'))}>I've verified</button>
      </span>
    </div>
  );
}

/** Route guard + themed application shell. The role theme is applied only after auth. */
export default function AppShell() {
  const { user, status, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) document.documentElement.dataset.theme = user.role;
  }, [user]);

  // Healthy habits for juniors: a friendly break reminder after 25 minutes, then every 25 minutes.
  const isKid = user?.role === 'kid';
  useEffect(() => {
    if (!isKid) return undefined;
    const t = setInterval(() => useUI.getState().toast('🧃 Great work! Time for a quick stretch or a drink of water. Your progress is saved.', 'info'), 25 * 60 * 1000);
    return () => clearInterval(t);
  }, [isKid]);

  useEffect(() => {
    const page = NAV.find((n) => (n.end ? location.pathname === n.to : location.pathname.startsWith(n.to)));
    document.title = page && !page.end ? `${page.label} · ${APP_NAME}` : APP_NAME;
    // On phones the bottom menu scrolls sideways: keep the current page's button in view.
    requestAnimationFrame(() => {
      const bar = document.querySelector('.sidebar');
      const active = bar?.querySelector('.nav-link.active');
      if (bar && active && bar.scrollWidth > bar.clientWidth) {
        bar.scrollTo({ left: active.offsetLeft - (bar.clientWidth - active.offsetWidth) / 2, behavior: 'smooth' });
      }
    });
  }, [location.pathname]);

  if (status !== 'ready') return <Loading label="Loading your academy…" />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;

  const nav = [...NAV, ...(user.role === 'admin' ? [{ to: '/app/admin', label: 'Admin', icon: '🛠️' }] : [])];
  const roleInfo = ROLE_INFO[user.role] ?? { label: 'Admin', emoji: '🛠️' };

  async function onLogout() {
    await logout();
    navigate('/');
  }

  return (
    <div className="shell">
      <a href="#main" className="skip-link">Skip to content</a>
      <nav className="sidebar" aria-label="Main">
        <Brand to="/app" />
        {nav.map((n) => (
          <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <span className="nav-icon" aria-hidden>{n.icon}</span>
            <span>{n.label}</span>
          </NavLink>
        ))}
        <div className="sidebar-foot">
          <NavLink to="/app/settings" className="sidebar-user">
            <span className="avatar" aria-hidden>{user.name.slice(0, 1).toUpperCase()}</span>
            <span>
              <b>{user.name}</b>
              <span className="muted small" style={{ display: 'block' }}>{roleInfo.emoji} {roleInfo.label}</span>
            </span>
          </NavLink>
          <button className="btn btn-ghost btn-sm" style={{ marginTop: 10, width: '100%' }} onClick={onLogout}>Log out</button>
        </div>
      </nav>
      <main className="main" id="main">
        <div className="topbar">
          <Brand to="/app" compact style={{ margin: 0 }} />
          <span className="row">
            <NavLink to="/app/settings" className="avatar" aria-label="Account settings">{user.name.slice(0, 1).toUpperCase()}</NavLink>
          </span>
        </div>
        {!user.emailVerified && user.provider === 'password' && <VerifyEmailBanner />}
        <div key={location.pathname} className="page-enter">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
