// Preview-only sign-in: simulates Firebase Authentication in the browser.
const KEY = 'mc-preview-accounts-v2';
export const configured = true;
export const isPreview = true;
export const DEMO_PASSWORD = 'preview123';
export const DEMO_ACCOUNTS = [
  { email: 'admin@preview.marketcraft', uid: 'demo-admin', label: 'Admin (you)', icon: 'admin', tone: 'blue' },
  { email: 'learner@preview.marketcraft', uid: 'demo-adult', label: 'Adult learner', icon: 'store', tone: 'teal' },
  { email: 'parent@preview.marketcraft', uid: 'demo-kid', label: 'Kid on a parent account', icon: 'rocket', tone: 'orange' },
  { email: 'graduate@preview.marketcraft', uid: 'demo-grad', label: 'Certified graduate (Lab)', icon: 'lab', tone: 'cyan' },
];

let current = null;
function accounts() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {};
  } catch {
    return {};
  }
}
function saveAccounts(a) {
  try {
    localStorage.setItem(KEY, JSON.stringify(a));
  } catch { /* in-memory only */ }
}
const err = (message, code) => Object.assign(new Error(message), { code });

export async function signIn(email, password) {
  const e = email.trim().toLowerCase();
  const demo = DEMO_ACCOUNTS.find((d) => d.email === e);
  const acc = accounts()[e];
  if (demo && password === DEMO_PASSWORD) current = { uid: demo.uid, email: e };
  else if (acc && acc.password === password) current = { uid: acc.uid, email: e, name: acc.name };
  else throw err('Email or password is incorrect.', 'auth/invalid-credential');
}
export async function signInGoogle() {
  throw err('Google sign-in works in the full app. In this preview, use email and password or a demo account.', 'auth/operation-not-allowed');
}
export async function signUp(email, password, name) {
  const e = email.trim().toLowerCase();
  if (!/\S+@\S+\.\S+/.test(e)) throw err('That email address doesn\'t look right.', 'auth/invalid-email');
  const all = accounts();
  if (all[e] || DEMO_ACCOUNTS.some((d) => d.email === e)) throw err('An account with that email already exists. Try logging in instead.', 'auth/email-already-in-use');
  all[e] = { uid: `u-${Math.random().toString(36).slice(2, 10)}`, password, name };
  saveAccounts(all);
  current = { uid: all[e].uid, email: e, name };
}
export const hasUser = () => Boolean(current);
export const idToken = async () => JSON.stringify({ uid: current.uid, email: current.email, name: current.name ?? '' });
export const resetPassword = async () => {};
export const resendVerification = async () => {};
export const reloadUser = async () => {};
export const setDisplayName = async () => {};
export const signOutProvider = async () => { current = null; };
