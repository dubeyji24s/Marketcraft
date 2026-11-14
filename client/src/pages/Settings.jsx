import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/auth.js';
import { useUI } from '../store/ui.js';
import { ErrorBox, ROLE_INFO } from '../components/common.jsx';

export default function Settings() {
  const { user, updateName, resetPassword, logout } = useAuth();
  const toast = useUI((s) => s.toast);
  const navigate = useNavigate();
  const [name, setName] = useState(user.name);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function saveName(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await updateName(name);
      toast('Name updated. New certificates will use it.', 'success');
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  }

  async function sendReset() {
    try {
      await resetPassword(user.email);
      toast(`Password reset link sent to ${user.email}`, 'success');
    } catch (e) {
      toast(e.message, 'error');
    }
  }

  const role = ROLE_INFO[user.role] ?? { label: 'Admin', emoji: '🛠️' };

  return (
    <div className="stack" style={{ '--gap': '22px', maxWidth: 720 }}>
      <header>
        <h1>Account settings</h1>
        <p className="muted">Manage your profile and sign-in.</p>
      </header>

      <form className="card" onSubmit={saveName}>
        <h2>Profile</h2>
        <ErrorBox error={error} />
        <div className="field">
          <label htmlFor="name">Name on certificates</label>
          <input id="name" type="text" value={name} maxLength={60} onChange={(e) => setName(e.target.value)} />
        </div>
        <button className="btn btn-primary" disabled={busy || name.trim().length < 2 || name.trim() === user.name}>Save name</button>
      </form>

      <div className="card">
        <h2>Account</h2>
        <dl className="kv">
          <dt>Email</dt>
          <dd>{user.email} {user.emailVerified ? <span className="chip chip-success">Verified</span> : <span className="chip chip-danger">Not verified</span>}</dd>
          <dt>Role</dt>
          <dd>{role.emoji} {role.label}</dd>
          <dt>Sign-in method</dt>
          <dd>{user.provider === 'google.com' ? 'Google' : 'Email & password'}</dd>
          <dt>Member since</dt>
          <dd>{new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</dd>
        </dl>
        <div className="row" style={{ marginTop: 16 }}>
          {user.provider !== 'google.com' && <button className="btn" onClick={sendReset}>Send password reset email</button>}
          <button className="btn btn-ghost" onClick={async () => { await logout(); navigate('/'); }}>Log out</button>
        </div>
      </div>
    </div>
  );
}
