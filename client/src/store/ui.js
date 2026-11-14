import { create } from 'zustand';
import { burstConfetti } from '../lib/confetti.js';

let nextId = 1;

export const useUI = create((set, get) => ({
  toasts: [],
  celebration: null, // { badges: [], xp, title }

  toast(message, kind = 'info') {
    const id = nextId++;
    set({ toasts: [...get().toasts, { id, message, kind }] });
    setTimeout(() => set({ toasts: get().toasts.filter((t) => t.id !== id) }), 4200);
  },
  celebrate({ badges = [], xp = 0, title }) {
    if (!badges.length && !title) {
      if (xp) get().toast(`+${xp} XP`, 'success');
      return;
    }
    burstConfetti();
    set({ celebration: { badges, xp, title } });
  },
  closeCelebration: () => set({ celebration: null }),
}));
