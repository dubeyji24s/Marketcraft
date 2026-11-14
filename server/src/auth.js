// Session handling.
// Identity comes from Firebase Authentication. After the server verifies a Firebase ID
// token it issues its own short, httpOnly session cookie, so every API call and every
// <video src> request is authenticated without exposing tokens to page JavaScript.
import jwt from 'jsonwebtoken';
import { config } from './config.js';
import { db } from './db.js';

export const ROLES = ['kid', 'adult', 'professional'];
export const ROLE_LABELS = {
  kid: 'Kid Entrepreneur',
  adult: 'Adult Business Owner',
  professional: 'Professional',
  admin: 'Admin',
};

const COOKIE = 'mc_session';
const MAX_AGE_MS = 5 * 24 * 60 * 60 * 1000;

export function issueSession(res, user) {
  const token = jwt.sign({ sub: user.id, uid: user.firebaseUid }, config.jwtSecret, { expiresIn: '5d' });
  res.cookie(COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: config.isProd,
    maxAge: MAX_AGE_MS,
    path: '/',
  });
}

export function clearSession(res) {
  res.clearCookie(COOKIE, { path: '/' });
}

export function publicUser(u) {
  if (!u) return null;
  const { firebaseUid, ...rest } = u;
  return { ...rest, roleLabel: ROLE_LABELS[u.role] };
}

/** Attaches req.user if a valid session cookie is present. Never rejects. */
export function loadUser(req, _res, next) {
  const token = req.cookies?.[COOKIE];
  if (token) {
    try {
      const payload = jwt.verify(token, config.jwtSecret);
      const user = db.get('users', payload.sub);
      // the cookie must still belong to the same Firebase account
      if (user && user.firebaseUid === payload.uid && !user.disabled) req.user = user;
    } catch {
      /* expired / tampered: treat as anonymous */
    }
  }
  next();
}

export function requireAuth(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Please log in to continue.' });
  next();
}

export function requireAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Please log in to continue.' });
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admins only.' });
  next();
}

/** Admin role is granted only to a verified email listed in ADMIN_EMAILS. */
export function isAdminEmail(email, emailVerified) {
  return Boolean(email && (emailVerified || config.emulator) && config.adminEmails.includes(email.toLowerCase()));
}
