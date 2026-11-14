// Auth state. The identity provider (Firebase in the app) handles passwords, Google,
// email verification and password reset. After every sign-in its ID token is exchanged
// for an httpOnly server session that all API calls use.
import { create } from 'zustand';
import { api, ApiError } from '../lib/api.js';
import * as provider from '@auth-provider';

async function exchange(profile) {
  const idToken = await provider.idToken();
  return api.post('/auth/session', { idToken, ...(profile ? { profile } : {}) });
}

export const useAuth = create((set, get) => ({
  user: null,
  status: 'idle', // idle | loading | ready
  pendingProfile: null, // { email, suggestedName } when an account still needs onboarding

  async bootstrap() {
    if (get().status !== 'idle') return;
    set({ status: 'loading' });
    try {
      const { user } = await api.get('/auth/me');
      set({ user, status: 'ready' });
    } catch {
      set({ user: null, status: 'ready' });
    }
  },

  /** Exchange the signed-in identity for a server session; handles onboarding. */
  async startSession(profile) {
    try {
      const { user } = await exchange(profile);
      set({ user, pendingProfile: null });
      return { user };
    } catch (err) {
      if (err instanceof ApiError && err.body?.needsProfile) {
        set({ pendingProfile: { email: err.body.email, suggestedName: err.body.suggestedName } });
        return { needsProfile: true };
      }
      throw err;
    }
  },

  async login(email, password) {
    await provider.signIn(email, password);
    return get().startSession();
  },

  async loginWithGoogle() {
    await provider.signInGoogle();
    return get().startSession();
  },

  async signup({ email, password, ...profile }) {
    await provider.signUp(email, password, profile.name);
    return get().startSession(profile);
  },

  async completeProfile(profile) {
    if (!provider.hasUser()) throw new Error('Your sign-in expired. Please sign in again.');
    return get().startSession(profile);
  },

  async resetPassword(email) {
    try {
      await provider.resetPassword(email);
    } catch (err) {
      if (err?.code === 'auth/user-not-found') return; // don't reveal whether an account exists
      throw err;
    }
  },

  async resendVerification() {
    if (!provider.hasUser()) throw new Error('Please log in again to resend the email.');
    await provider.resendVerification();
  },

  /** After the user clicks the link in the verification email. */
  async refreshVerification() {
    if (!provider.hasUser()) throw new Error('Please log out and back in to refresh your status.');
    await provider.reloadUser();
    const { user } = await exchange();
    set({ user });
    return user;
  },

  async updateName(name) {
    const { user } = await api.patch('/auth/profile', { name });
    provider.setDisplayName(name).catch(() => {});
    set({ user });
  },

  async logout() {
    await api.post('/auth/logout').catch(() => {});
    await provider.signOutProvider().catch(() => {});
    set({ user: null, pendingProfile: null });
  },

  async refresh() {
    try {
      const { user } = await api.get('/auth/me');
      set({ user });
    } catch {
      /* keep current */
    }
  },
}));
