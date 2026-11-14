// Firebase client setup. Values come from client/.env (see .env.example).
// A Firebase web config is not a secret: it identifies your project and ships in the
// browser bundle. Access is protected by Firebase Auth + the server's token checks.
import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, GoogleAuthProvider } from 'firebase/auth';

const env = import.meta.env;

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  appId: env.VITE_FIREBASE_APP_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID,
};

export const firebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

export const auth = firebaseConfigured ? getAuth(initializeApp(firebaseConfig)) : null;

if (auth && env.VITE_FIREBASE_AUTH_EMULATOR_HOST) {
  connectAuthEmulator(auth, `http://${env.VITE_FIREBASE_AUTH_EMULATOR_HOST}`, { disableWarnings: true });
}

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

const MESSAGES = {
  'auth/invalid-credential': 'Email or password is incorrect.',
  'auth/wrong-password': 'Email or password is incorrect.',
  'auth/user-not-found': 'Email or password is incorrect.',
  'auth/invalid-email': 'That email address doesn\'t look right.',
  'auth/email-already-in-use': 'An account with that email already exists. Try logging in instead.',
  'auth/weak-password': 'Please choose a stronger password (at least 8 characters with a letter and a number).',
  'auth/too-many-requests': 'Too many attempts. Please wait a moment and try again.',
  'auth/network-request-failed': 'Network problem. Check your connection and try again.',
  'auth/popup-closed-by-user': 'The Google sign-in window was closed before finishing.',
  'auth/popup-blocked': 'Your browser blocked the Google sign-in pop-up. Allow pop-ups for this site and try again.',
  'auth/cancelled-popup-request': 'The Google sign-in window was closed before finishing.',
  'auth/account-exists-with-different-credential': 'This email is already registered with a different sign-in method.',
  'auth/user-disabled': 'This account has been disabled. Contact your teacher or admin.',
  'auth/operation-not-allowed': 'This sign-in method isn\'t enabled in Firebase yet.',
  'auth/internal-error': 'Sign-in couldn\'t load. Check your connection (or ad-blocker) and try again.',
  'auth/unauthorized-domain': 'This website\'s domain isn\'t authorized in Firebase Authentication settings.',
};

/** Convert Firebase errors into friendly messages. */
export function friendlyAuthError(err) {
  const msg = MESSAGES[err?.code];
  return msg ? Object.assign(new Error(msg), { code: err.code }) : err;
}
