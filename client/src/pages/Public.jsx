import { useEffect, useState } from 'react';
import { IconTile, TONES, ROLE_ICONS } from '../components/Icon.jsx';
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../store/auth.js';
import { usePublicTheme } from '../components/AppShell.jsx';
import { ErrorBox, Loading, ROLE_INFO } from '../components/common.jsx';
import { Brand, LogoMark, APP_NAME } from '../components/Brand.jsx';
import * as authProvider from '@auth-provider';

const firebaseConfigured = authProvider.configured;
import { useApi } from '../lib/useApi.js';

function PublicNav() {
  const user = useAuth((s) => s.user);
  return (
    <header className="container landing-nav">
      <Brand style={{ margin: 0 }} />
      <nav className="row" aria-label="Account">
        {user ? (
          <Link className="btn btn-primary" to="/app">Open dashboard</Link>
        ) : (
          <>
            <Link className="btn btn-ghost" to="/login">Log in</Link>
            <Link className="btn btn-primary" to="/signup">Get started</Link>
          </>
        )}
      </nav>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container row spread">
        <span className="muted small">© {new Date().getFullYear()} {APP_NAME} · 🔒 We never sell your personal info · No marketing emails</span>
        <nav className="row small" aria-label="Legal">
          <Link to="/privacy">Privacy</Link>
          <Link to="/terms">Terms</Link>
        </nav>
      </div>
    </footer>
  );
}

export function Landing() {
  usePublicTheme();
  const features = [
    { icon: 'phone', tone: 'violet', title: 'Swipe lessons', text: 'Every lesson as quick, visual cards with read-aloud. 36 researched lessons from sources like the SBA and FTC, always cited.' },
    { icon: 'compass', tone: 'teal', title: 'Real decisions, real results', text: 'Each lesson drops you into a business situation. Pick what you\'d do and instantly see what happens.' },
    { icon: 'ideas', tone: 'amber', title: 'Build your own idea', text: 'Your Idea Board turns lessons into a real plan: customer, price, profit, channels and a poster to download.' },
    { icon: 'studio', tone: 'pink', title: 'Studio + AI coach', text: 'Film a real pitch and get scored on clarity, audience, value and visuals. Retry until you hit the professional 85%.' },
    { icon: 'medal', tone: 'orange', title: 'Showcase & real medals', text: 'Share your marketing videos. Juniors whose video reaches 1,000 views get a free medal posted home.' },
    { icon: 'ambassador', tone: 'blue', title: 'Certificates & Ambassador', text: 'Earn verifiable certificates. Graduates 18+ unlock the Marketing Lab with six AI tools, Creator, design and video.' },
  ];
  const steps = [
    ['Learn', 'Bite-sized lessons on marketing that costs little or nothing.'],
    ['Watch', 'Interviews with owners who grew on a shoestring.'],
    ['Practice', 'Film a pitch for a real product challenge.'],
    ['Get certified', 'Reach the professional standard (85%+) with the AI coach. Retry until you do.'],
    ['Become an ambassador', 'Graduates 18+ join and their Marketing Lab opens: every tool works, but only to market our partner website.'],
    ['Unlock your own brand', 'Earn the Ambassador certificate and the Lab opens up for your OWN product or service, with every tool in one place.'],
  ];
  return (
    <div className="page-shell">
      <PublicNav />
      <main>
        <section className="container hero" style={{ position: 'relative' }}>
          <div className="floaters" aria-hidden>
            <IconTile name="megaphone" tone="orange" size={58} style={{ left: '6%', top: '12%' }} />
            <IconTile name="trend" tone="teal" size={52} style={{ right: '8%', top: '20%', animationDelay: '1s' }} />
            <IconTile name="ideas" tone="amber" size={48} style={{ left: '12%', bottom: '2%', animationDelay: '2s' }} />
            <IconTile name="heart" tone="pink" size={50} style={{ right: '13%', bottom: '8%', animationDelay: '0.5s' }} />
          </div>
          <div className="hero-logo"><LogoMark size={96} /></div>
        <span className="chip chip-brand">The Marketcraft course · for kids (with a parent), owners & pros</span>
          <h1 style={{ marginTop: 18 }}>
            Craft big marketing results.<br /><span className="gradient-text">On tiny budgets.</span>
          </h1>
          <p className="lead">
            {APP_NAME} teaches low-cost, direct-to-consumer marketing through bite-sized lessons, real interviews, and hands-on
            pitch challenges graded by an AI coach.
          </p>
          <div className="row" style={{ justifyContent: 'center' }}>
            <Link className="btn btn-primary btn-lg" to="/signup">Create my free account</Link>
            <Link className="btn btn-lg" to="/login">I have an account</Link>
          </div>
          <div className="hero-pills">
            <span className="hero-pill"><IconTile name="zap" tone="violet" size={28} /> 3-minute lessons</span>
            <span className="hero-pill"><IconTile name="flame" tone="orange" size={28} /> Daily streaks</span>
            <span className="hero-pill"><IconTile name="shield" tone="green" size={28} /> We never sell your info</span>
          </div>
        </section>

        <section className="container feature-grid stagger" style={{ paddingBottom: 56 }} aria-label="Features">
          {features.map((f) => (
            <div className="card feature-card" key={f.title} style={{ '--ia': TONES[f.tone][0] }}>
              <IconTile name={f.icon} tone={f.tone} size={52} />
              <h3>{f.title}</h3>
              <p className="muted small" style={{ margin: 0 }}>{f.text}</p>
            </div>
          ))}
        </section>

        <section className="container" style={{ paddingBottom: 56 }}>
          <h2 style={{ textAlign: 'center' }}>How it works</h2>
          <ol className="steps">
            {steps.map(([t, d], i) => (
              <li key={t} className="card">
                <span className="step-num">{i + 1}</span>
                <h3>{t}</h3>
                <p className="muted small" style={{ margin: 0 }}>{d}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="container" style={{ paddingBottom: 80 }}>
          <h2 style={{ textAlign: 'center' }}>Pick your path</h2>
          <div className="path-grid stagger">
            {Object.entries(ROLE_INFO).map(([key, r]) => (
              <Link key={key} to={`/signup?role=${key}`} className="card interactive card-accent">
                <IconTile name={ROLE_ICONS[key][0]} tone={ROLE_ICONS[key][1]} size={56} />
                <h3>{r.label}</h3>
                <p className="muted" style={{ margin: 0 }}>{r.blurb}</p>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function AuthFrame({ title, subtitle, children }) {
  usePublicTheme();
  return (
    <div className="page-shell">
      <PublicNav />
      <main className="container" style={{ maxWidth: 520, padding: '30px 0 80px' }}>
        <div className="card page-enter">
          <div className="auth-logo"><LogoMark size={64} /></div>
          <h1 style={{ fontSize: '2rem', textAlign: 'center' }}>{title}</h1>
          {subtitle && <p className="muted" style={{ textAlign: 'center' }}>{subtitle}</p>}
          {!firebaseConfigured && (
            <div className="alert alert-error small">
              Sign-in isn't configured yet. Add your Firebase web settings to <code>client/.env</code> (see the README).
            </div>
          )}
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}

function GoogleButton({ onClick, busy, label = 'Continue with Google' }) {
  return (
    <button type="button" className="btn btn-google" style={{ width: '100%' }} onClick={onClick} disabled={busy || !firebaseConfigured}>
      <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
        <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
        <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
        <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
        <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
      </svg>
      {label}
    </button>
  );
}

const Divider = () => <div className="divider"><span>or</span></div>;

function useAfterAuth() {
  const navigate = useNavigate();
  const location = useLocation();
  return (result) => {
    if (result?.needsProfile) navigate('/onboarding', { replace: true, state: location.state });
    else navigate(location.state?.from || '/app', { replace: true });
  };
}

export function Login() {
  const { user, login, loginWithGoogle } = useAuth();
  const afterAuth = useAfterAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/app" replace />;

  async function run(fn) {
    setBusy(true);
    setError(null);
    try {
      afterAuth(await fn());
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthFrame title="Welcome back 👋" subtitle="Log in to keep building your marketing skills.">
      <ErrorBox error={error} />
      {authProvider.isPreview && (
        <div className="alert alert-info">
          <p style={{ margin: '0 0 10px' }}><b>👀 Preview:</b> jump in as a demo account, or sign up below.</p>
          <div className="row">
            {authProvider.DEMO_ACCOUNTS.map((d) => (
              <button key={d.email} type="button" className="btn btn-sm" disabled={busy} onClick={() => run(() => login(d.email, authProvider.DEMO_PASSWORD))}>
                <IconTile name={d.icon ?? 'users'} tone={d.tone ?? 'violet'} size={22} /> {d.label}
              </button>
            ))}
          </div>
        </div>
      )}
      <GoogleButton busy={busy} onClick={() => run(loginWithGoogle)} />
      <Divider />
      <form onSubmit={(e) => { e.preventDefault(); run(() => login(form.email, form.password)); }} noValidate>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" autoComplete="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div className="field">
          <div className="row spread"><label htmlFor="password">Password</label><Link className="small" to="/forgot-password">Forgot password?</Link></div>
          <input id="password" type="password" autoComplete="current-password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </div>
        <button className="btn btn-primary" style={{ width: '100%' }} disabled={busy || !firebaseConfigured}>
          {busy ? <span className="spinner" /> : 'Log in'}
        </button>
      </form>
      <p className="muted small" style={{ marginTop: 16 }}>New here? <Link to="/signup">Create an account</Link></p>
    </AuthFrame>
  );
}

/** Role + name + age fields, shared by signup and onboarding. */
function ProfileFields({ form, setForm, accountWord = 'account' }) {
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
  const kid = form.role === 'kid';
  return (
    <>
      <fieldset className="field" style={{ border: 0, padding: 0, margin: '0 0 16px' }}>
        <legend style={{ fontWeight: 600, marginBottom: 8 }}>Who is learning?</legend>
        <div className="segmented" role="radiogroup">
          {Object.entries(ROLE_INFO).map(([key, r]) => (
            <button type="button" key={key} role="radio" aria-checked={form.role === key} className="choice" onClick={() => setForm({ ...form, role: key })}>
              <IconTile name={ROLE_ICONS[key][0]} tone={ROLE_ICONS[key][1]} size={40} style={{ marginBottom: 8 }} />
              <b>{r.label}</b>
              <span className="muted small" style={{ display: 'block' }}>{key === 'kid' ? 'Under 18 · parent\'s account' : '18 and older'}</span>
            </button>
          ))}
        </div>
      </fieldset>
      {kid && (
        <>
          <div className="alert alert-info">
            <p style={{ margin: 0 }}>
              <b>👨‍👩‍👧 Parents, this part is for you.</b> Kids and teens under 18 learn on <b>your</b> {accountWord}: sign up with <b>your own</b> email
              and password (or your Google account). Your child learns with it while you supervise.
            </p>
          </div>
          <fieldset className="field" style={{ border: 0, padding: 0, margin: '0 0 16px' }}>
            <legend style={{ fontWeight: 600, marginBottom: 8 }}>How old is your child?</legend>
            <div className="segmented" role="radiogroup">
              <button type="button" role="radio" aria-checked={form.ageGroup === 'under13'} className="choice" onClick={() => setForm({ ...form, ageGroup: 'under13' })}>
                <IconTile name="puzzle" tone="amber" size={36} style={{ marginBottom: 6 }} /><b>Under 13</b>
              </button>
              <button type="button" role="radio" aria-checked={form.ageGroup === 'teen'} className="choice" onClick={() => setForm({ ...form, ageGroup: 'teen' })}>
                <IconTile name="grad" tone="teal" size={36} style={{ marginBottom: 6 }} /><b>13 – 17</b>
              </button>
            </div>
          </fieldset>
        </>
      )}
      <div className="field">
        <label htmlFor="name">{kid ? "Child's first name" : 'Full name'}</label>
        <input id="name" type="text" autoComplete={kid ? 'off' : 'name'} required value={form.name} onChange={set('name')} aria-describedby="name-hint" />
        <div id="name-hint" className="hint">This is printed on certificates.{kid ? ' First name only, for privacy.' : ''}</div>
      </div>
      {kid ? (
        <>
          <div className="field">
            <label htmlFor="parentName">Parent / guardian name <span className="muted">(optional)</span></label>
            <input id="parentName" type="text" autoComplete="name" value={form.parentName} onChange={set('parentName')} />
          </div>
          <label className="checkbox field">
            <input type="checkbox" checked={form.parentAccount} onChange={(e) => setForm({ ...form, parentAccount: e.target.checked, guardianConsent: e.target.checked })} />
            <span>I'm the parent/guardian (18+), this is <b>my own</b> {accountWord}, and I agree to my child using {APP_NAME} under my supervision, including uploading practice videos.</span>
          </label>
        </>
      ) : (
        <label className="checkbox field">
          <input type="checkbox" checked={form.adultConfirmed} onChange={set('adultConfirmed')} />
          <span>I confirm I am <b>18 or older</b>. (Under 18? Ask a parent to sign up as a Kid Entrepreneur.)</span>
        </label>
      )}
    </>
  );
}

const profileOk = (f) =>
  f.name.trim().length >= 2 && (f.role === 'kid' ? Boolean(f.ageGroup && f.parentAccount && f.guardianConsent) : f.adultConfirmed);
const pickProfile = ({ name, role, ageGroup, parentAccount, parentName, guardianConsent, adultConfirmed }) =>
  role === 'kid' ? { name, role, ageGroup, parentAccount, parentName, guardianConsent } : { name, role, adultConfirmed };
const EMPTY_PROFILE = { name: '', ageGroup: '', parentAccount: false, parentName: '', guardianConsent: false, adultConfirmed: false };

export function Signup() {
  const { user, signup, loginWithGoogle } = useAuth();
  const afterAuth = useAfterAuth();
  const params = new URLSearchParams(useLocation().search);
  const [form, setForm] = useState({
    ...EMPTY_PROFILE,
    email: '',
    password: '',
    role: ROLE_INFO[params.get('role')] ? params.get('role') : 'adult',
    agree: false,
  });
  const kidAccount = form.role === 'kid';
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/app" replace />;

  const pwOk = form.password.length >= 8 && /[A-Za-z]/.test(form.password) && /\d/.test(form.password);

  async function run(fn) {
    setBusy(true);
    setError(null);
    try {
      afterAuth(await fn());
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthFrame title={`Join ${APP_NAME}`} subtitle="Choose your path. Your dashboard theme changes to match!">
      <ErrorBox error={error} />
      <form onSubmit={(e) => { e.preventDefault(); run(() => signup({ email: form.email, password: form.password, ...pickProfile(form) })); }} noValidate>
        <ProfileFields form={form} setForm={setForm} />
        <GoogleButton busy={busy} label={kidAccount ? "Sign up with the parent's Google" : 'Sign up with Google'} onClick={() => run(loginWithGoogle)} />
        <Divider />
        <div className="field">
          <label htmlFor="email">{kidAccount ? "Parent's email" : 'Email'}</label>
          <input id="email" type="email" autoComplete="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} aria-describedby="email-promise" />
          <div id="email-promise" className="hint">🔒 We never sell your email and never send marketing emails. <Link to="/privacy" target="_blank">Privacy</Link></div>
        </div>
        <div className="field">
          <label htmlFor="password">{kidAccount ? "Parent's password" : 'Password'}</label>
          <input id="password" type="password" autoComplete="new-password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} aria-describedby="pw-hint" />
          <div id="pw-hint" className="hint" style={{ color: form.password && !pwOk ? 'var(--danger)' : undefined }}>
            At least 8 characters with a letter and a number.
          </div>
        </div>
        <label className="checkbox field">
          <input type="checkbox" checked={form.agree} onChange={(e) => setForm({ ...form, agree: e.target.checked })} />
          <span className="small">I agree to the <Link to="/terms" target="_blank">Terms</Link> and <Link to="/privacy" target="_blank">Privacy Policy</Link>.</span>
        </label>
        <button className="btn btn-primary" style={{ width: '100%' }} disabled={busy || !pwOk || !form.agree || !profileOk(form) || !firebaseConfigured}>
          {busy ? <span className="spinner" /> : 'Create account'}
        </button>
      </form>
      <p className="muted small" style={{ marginTop: 16 }}>Already have one? <Link to="/login">Log in</Link></p>
    </AuthFrame>
  );
}

/** Shown when a Firebase account (e.g. a first Google sign-in) has no learner profile yet. */
export function Onboarding() {
  const { user, pendingProfile, completeProfile, logout } = useAuth();
  const afterAuth = useAfterAuth();
  const [form, setForm] = useState({ ...EMPTY_PROFILE, name: pendingProfile?.suggestedName ?? '', role: 'adult', agree: false });
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/app" replace />;
  if (!pendingProfile) return <Navigate to="/login" replace />;

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      afterAuth(await completeProfile(pickProfile(form)));
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthFrame title="One last step ✨" subtitle={`Set up your learner profile for ${pendingProfile.email ?? 'your account'}.`}>
      <ErrorBox error={error} />
      <form onSubmit={submit} noValidate>
        <ProfileFields form={form} setForm={setForm} accountWord={`account (${pendingProfile.email ?? 'this login'})`} />
        <label className="checkbox field">
          <input type="checkbox" checked={form.agree} onChange={(e) => setForm({ ...form, agree: e.target.checked })} />
          <span className="small">I agree to the <Link to="/terms" target="_blank">Terms</Link> and <Link to="/privacy" target="_blank">Privacy Policy</Link>.</span>
        </label>
        <button className="btn btn-primary" style={{ width: '100%' }} disabled={busy || !form.agree || !profileOk(form)}>
          {busy ? <span className="spinner" /> : 'Finish setup'}
        </button>
      </form>
      <button className="btn btn-ghost btn-sm" style={{ marginTop: 12 }} onClick={logout}>Use a different account</button>
    </AuthFrame>
  );
}

export function ForgotPassword() {
  const resetPassword = useAuth((s) => s.resetPassword);
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await resetPassword(email);
      setSent(true);
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthFrame title="Reset your password" subtitle="We'll email you a link to choose a new password.">
      <ErrorBox error={error} />
      {sent ? (
        <div className="alert alert-success">If an account exists for <b>{email}</b>, a reset link is on its way. Check your inbox (and spam folder).</div>
      ) : (
        <form onSubmit={submit} noValidate>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <button className="btn btn-primary" style={{ width: '100%' }} disabled={busy || !email || !firebaseConfigured}>
            {busy ? <span className="spinner" /> : 'Send reset link'}
          </button>
        </form>
      )}
      <p className="muted small" style={{ marginTop: 16 }}><Link to="/login">← Back to log in</Link></p>
    </AuthFrame>
  );
}

export function Verify() {
  usePublicTheme();
  const { code } = useParams();
  const { data, error, loading } = useApi(`/studio/certificates/verify/${encodeURIComponent(code)}`);
  return (
    <div className="page-shell">
      <PublicNav />
      <main className="container" style={{ maxWidth: 560, padding: '30px 0' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          {loading ? (
            <Loading label="Checking certificate…" />
          ) : error || !data?.valid ? (
            <>
              <div style={{ fontSize: '3rem' }} aria-hidden>❌</div>
              <h2>Certificate not found</h2>
              <p className="muted">The code <code>{code}</code> doesn't match any {APP_NAME} certificate.</p>
            </>
          ) : (
            <>
              <div style={{ fontSize: '3rem' }} aria-hidden>✅</div>
              <h2>Verified certificate</h2>
              <p><b>{data.recipientName}</b> earned <b>{data.badge}</b> ({data.tier}) for “{data.challengeTitle}” on {new Date(data.issuedAt).toLocaleDateString()}.</p>
              <p className="muted small">Issued by {APP_NAME}</p>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

const LEGAL = {
  privacy: {
    title: 'Privacy Policy',
    body: [
      ['Draft notice', `${APP_NAME} is currently a school project. This policy is a working draft and must be reviewed by a qualified professional before the service is offered to the public.`],
      ['We never sell your information', 'We never sell, rent or trade your personal information, including your email address, to anyone. We only use it to run your Marketcraft account.'],
      ['No marketing emails', 'We don\'t send newsletters, promotions or any marketing emails. The only emails you will ever get are the sign-in ones you ask for: a link to verify your email address and, if you request it, a password reset link. These are sent by Google Firebase, the service that runs our sign-in.'],
      ['What we collect', 'Your name, email address and chosen role; a parent/guardian email for Kid Entrepreneur accounts; lesson progress, quiz results, badges, streaks and certificates; the practice videos, links, ideas and written strategies you submit; and, only for a junior medal request, a postal address that is deleted once the medal is sent.'],
      ['How sign-in works', 'Accounts are managed by Google Firebase Authentication. We never see or store your password.'],
      ['AI processing', 'To give feedback, your written strategy, optional script and a few still frames from your uploaded video are sent to our AI provider (Anthropic) for evaluation. They are not used to publish anything.'],
      ['Creator AI pictures', 'If you tick "Add a free AI picture" in Creator, your picture description (not your name or account) is sent to the free Pollinations image service to draw the picture. Leave it off if you prefer.'],
      ['Your Canva', 'If you connect your own Canva account, we store an encrypted access token so we can send designs you choose to your Canva. You can disconnect at any time.'],
      ['Who can see your videos', 'Your practice and Studio videos are seen only by you and Marketcraft administrators. In the Showcase, a video stays private unless you choose "Community"; it is then shown to other signed-in learners only after an administrator approves it. Videos are never shown to the public internet.'],
      ['Children', 'Anyone under 18 may only use Marketcraft through a parent\'s or guardian\'s own account; we store only the child\'s first name for certificates. A parent or guardian can ask us to view or delete their child\'s data at any time.'],
      ['Junior medal addresses', 'If a junior\'s Showcase video reaches 1,000 views, a parent or guardian can ask us to post a free medal. Only then do we ask for a postal address. It is entered by the parent, seen only by the Marketcraft administrator, used only to post the medal, and deleted as soon as the medal is sent (or the request is declined). Views are counted once per signed-in Marketcraft member; we store which members viewed a video only to count unique views.'],
      ['Ideas, streaks and swipe lessons', 'Your Idea Board / Business Canvas, pictures you add to it, your daily streak and which lessons you have swiped through are private to you (administrators can see them only to run the service). "Read to me" uses your own browser\'s built-in voice, so no text is sent anywhere.'],
      ['Ambassador Program', 'If you join the Ambassador Program, we store your referral code and the drafts you create with the AI marketing tools (your 30 most recent). The program is for account holders 18+ (kids only through a parent\'s account). Your Marketcraft login also works as a normal user account on our partner website, which has its own privacy policy.'],
      ['Your choices', 'You can ask for a copy of your data or for your account to be deleted by contacting the site administrator.'],
    ],
  },
  terms: {
    title: 'Terms of Use',
    body: [
      ['Draft notice', `${APP_NAME} is currently a school project. These terms are a working draft.`],
      ['Using the academy', 'Use Marketcraft to learn and practice marketing. Be respectful, and only upload videos you made or have permission to use.'],
      ['Your content', 'You keep ownership of the videos and writing you submit. You allow us to store and process them to provide feedback and certificates.'],
      ['AI feedback', 'Scores and feedback are generated automatically for learning purposes and may not be perfect.'],
      ['Certificates', 'Certificates recognize completion of a practice challenge. They are not an accredited qualification.'],
      ['Accounts', 'Keep your login private. Anyone under 18 must use a parent\'s or guardian\'s account under their supervision. Adult accounts confirm they are 18 or older. We may suspend accounts that misuse the service.'],
      ['Brand ambassadors', 'Ambassadors must follow the ambassador guidelines: be honest, clearly disclose the relationship in every post, never invent claims, and never spam. Breaking them can end your ambassador status.'],
    ],
  },
};

export function Legal({ kind }) {
  usePublicTheme();
  const doc = LEGAL[kind];
  useEffect(() => {
    document.title = `${doc.title} · ${APP_NAME}`;
    return () => { document.title = APP_NAME; };
  }, [doc.title]);
  return (
    <div className="page-shell">
      <PublicNav />
      <main className="container" style={{ maxWidth: 760, padding: '20px 0 60px' }}>
        <article className="card prose">
          <h1>{doc.title}</h1>
          <p className="muted small">Last updated {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}</p>
          {doc.body.map(([h, t]) => (
            <section key={h}><h3>{h}</h3><p>{t}</p></section>
          ))}
        </article>
      </main>
      <Footer />
    </div>
  );
}

export function NotFound() {
  usePublicTheme();
  return (
    <div className="page-shell">
      <PublicNav />
      <main className="container hero">
        <div style={{ fontSize: '4rem' }} aria-hidden>🛸</div>
        <h1>Page not found</h1>
        <p className="lead">That page doesn't exist or has moved.</p>
        <Link className="btn btn-primary" to="/">Back to home</Link>
      </main>
    </div>
  );
}
