// Firebase sign-in → server session.
//
//   Browser signs in with Firebase (email/password or Google) → gets an ID token
//   → POST /api/auth/session { idToken, profile? }
//   → server verifies the token with Firebase Admin, finds or creates the learner
//     profile, and sets an httpOnly session cookie.
//
// New accounts must send `profile` (name + role, plus guardian details for kids).
// If an existing Firebase account has no profile yet (e.g. first Google sign-in),
// the server answers 404 { needsProfile: true } and the app shows onboarding.
import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { db } from '../db.js';
import { ROLES, issueSession, clearSession, publicUser, isAdminEmail } from '../auth.js';
import { verifyIdToken } from '../firebase.js';

const router = Router();

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 40, standardHeaders: true, legacyHeaders: false });

// A brand-new session must come from a recent sign-in, so a leaked old ID token
// can't be turned into a 5-day session. Refreshing an existing session is exempt.
const MAX_SIGN_IN_AGE_S = 10 * 60;

// Age rules:
//  - Kid Entrepreneurs (anyone under 18) learn on a PARENT's own account (parent's email
//    or Google); the child's first name is stored for certificates.
//  - Adult Business Owner / Professional accounts must confirm the holder is 18+.
const ProfileSchema = z
  .object({
    name: z.string().trim().min(2, 'Please enter a name (at least 2 characters).').max(60),
    role: z.enum(ROLES),
    ageGroup: z.enum(['under13', 'teen']).optional(),
    parentAccount: z.boolean().optional(),
    parentName: z.string().trim().max(60).optional().or(z.literal('')),
    guardianConsent: z.boolean().optional(),
    adultConfirmed: z.boolean().optional(),
  })
  .superRefine((d, ctx) => {
    if (d.role === 'kid') {
      if (!d.ageGroup) ctx.addIssue({ code: 'custom', path: ['ageGroup'], message: 'Please tell us the learner\'s age group.' });
      if (d.parentAccount !== true || d.guardianConsent !== true) {
        ctx.addIssue({ code: 'custom', path: ['parentAccount'], message: 'Learners under 18 must use a parent\'s account, and the parent must give consent.' });
      }
    } else if (d.adultConfirmed !== true) {
      ctx.addIssue({ code: 'custom', path: ['adultConfirmed'], message: 'Please confirm you are 18 or older. Under 18? Ask a parent to sign up as a Kid Entrepreneur.' });
    }
  });

const SessionSchema = z.object({
  idToken: z.string().min(20).max(8192),
  profile: z.unknown().optional(),
});

router.post('/session', authLimiter, async (req, res, next) => {
  const parsed = SessionSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Missing sign-in token.' });

  let decoded;
  try {
    decoded = await verifyIdToken(parsed.data.idToken);
  } catch (err) {
    if (err.status) return next(err);
    return res.status(401).json({ error: 'Your sign-in expired. Please sign in again.' });
  }

  const refreshing = req.user?.firebaseUid === decoded.uid;
  if (!refreshing && Date.now() / 1000 - decoded.auth_time > MAX_SIGN_IN_AGE_S) {
    return res.status(401).json({ error: 'Please sign in again to continue.' });
  }

  const email = decoded.email?.toLowerCase() ?? null;
  const emailVerified = Boolean(decoded.email_verified);
  const provider = decoded.firebase?.sign_in_provider ?? 'password';
  let user = db.find('users', (u) => u.firebaseUid === decoded.uid);

  if (!user) {
    if (parsed.data.profile === undefined) {
      return res.status(404).json({ needsProfile: true, email, suggestedName: decoded.name ?? '' });
    }
    const profile = ProfileSchema.safeParse(parsed.data.profile);
    if (!profile.success) return res.status(400).json({ error: profile.error.issues[0].message });
    const p = profile.data;
    user = await db.insert('users', {
      firebaseUid: decoded.uid,
      email,
      emailVerified,
      provider,
      name: p.name,
      role: isAdminEmail(email, emailVerified) ? 'admin' : p.role,
      learnerRole: p.role,
      ageGroup: p.role === 'kid' ? p.ageGroup : undefined,
      // kids: the signed-in account IS the parent's, so the guardian is its owner
      accountHolder: p.role === 'kid' ? 'parent' : 'self',
      adultConfirmedAt: p.role === 'kid' ? undefined : new Date().toISOString(),
      parentName: p.role === 'kid' ? p.parentName || undefined : undefined,
      guardianEmail: p.role === 'kid' ? email : undefined,
      guardianConsentAt: p.role === 'kid' ? new Date().toISOString() : undefined,
      xp: 0,
      badges: [],
      completedLessons: [],
      lastLoginAt: new Date().toISOString(),
    });
  } else {
    // keep identity facts in sync with Firebase; promote/demote admins from ADMIN_EMAILS
    const admin = isAdminEmail(email, emailVerified);
    user = await db.update('users', user.id, {
      email,
      emailVerified,
      provider,
      role: admin ? 'admin' : user.role === 'admin' ? user.learnerRole ?? 'professional' : user.role,
      lastLoginAt: new Date().toISOString(),
    });
  }

  issueSession(res, user);
  res.json({ user: publicUser(user) });
});

router.post('/logout', (_req, res) => {
  clearSession(res);
  res.json({ ok: true });
});

// Learners can fix the name printed on their certificates.
router.patch('/profile', async (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Please log in to continue.' });
  const parsed = z.object({ name: z.string().trim().min(2).max(60) }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Please enter a name of 2-60 characters.' });
  const user = await db.update('users', req.user.id, { name: parsed.data.name });
  res.json({ user: publicUser(user) });
});

// 200 with user:null when anonymous, so the app's session probe isn't an error
router.get('/me', (req, res) => {
  res.json({ user: publicUser(req.user) });
});

export default router;
