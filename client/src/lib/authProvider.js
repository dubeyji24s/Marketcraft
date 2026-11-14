// Real identity provider: Firebase Authentication.
// (The preview build swaps this module for src/preview/authProvider.js via a Vite alias.)
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { auth, googleProvider, friendlyAuthError, firebaseConfigured } from './firebase.js';

export const configured = firebaseConfigured;
export const isPreview = false;

function fb() {
  if (!auth) throw new Error('Sign-in isn\'t set up yet. Add your Firebase settings to client/.env.');
  return auth;
}
const wrap = (fn) => async (...args) => {
  try {
    return await fn(...args);
  } catch (err) {
    throw friendlyAuthError(err);
  }
};

export const signIn = wrap((email, password) => signInWithEmailAndPassword(fb(), email, password));
export const signInGoogle = wrap(() => signInWithPopup(fb(), googleProvider));
export const signUp = wrap(async (email, password, displayName) => {
  const cred = await createUserWithEmailAndPassword(fb(), email, password);
  await updateProfile(cred.user, { displayName });
  sendEmailVerification(cred.user).catch(() => {}); // non-blocking
});
export const hasUser = () => Boolean(auth?.currentUser);
export const idToken = () => fb().currentUser.getIdToken(true);
export const resetPassword = wrap((email) => sendPasswordResetEmail(fb(), email));
export const resendVerification = () => sendEmailVerification(fb().currentUser);
export const reloadUser = () => fb().currentUser.reload();
export const setDisplayName = (name) => (auth?.currentUser ? updateProfile(auth.currentUser, { displayName: name }) : Promise.resolve());
export const signOutProvider = () => (auth ? signOut(auth) : Promise.resolve());
