// Firebase Admin: verifies the ID tokens the browser gets from Firebase Authentication.
//
// Verifying an ID token only needs the project ID (Google's public signing keys are
// fetched automatically), so no service-account key is required. If
// GOOGLE_APPLICATION_CREDENTIALS points at a service-account file, revoked tokens are
// rejected as well. With FIREBASE_AUTH_EMULATOR_HOST set, tokens from the local Auth
// emulator are accepted instead (development and tests only).
import { initializeApp, getApps, applicationDefault } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { config } from './config.js';

let auth = null;

function firebaseAuth() {
  if (auth) return auth;
  if (!config.firebaseProjectId) {
    throw Object.assign(new Error('Sign-in is not configured on the server (FIREBASE_PROJECT_ID is missing).'), { status: 503 });
  }
  const app =
    getApps()[0] ??
    initializeApp({
      projectId: config.firebaseProjectId,
      ...(config.hasServiceAccount ? { credential: applicationDefault() } : {}),
    });
  auth = getAuth(app);
  return auth;
}

let verifier = async (idToken) => firebaseAuth().verifyIdToken(idToken, config.hasServiceAccount);

/** @returns decoded token: { uid, email, email_verified, name, auth_time, firebase: { sign_in_provider } } */
export function verifyIdToken(idToken) {
  return verifier(idToken);
}

/** Test hook: replace token verification. */
export function setTokenVerifier(fn) {
  verifier = fn;
}
