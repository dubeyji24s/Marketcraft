import { useUI } from '../store/ui.js';

/** Tells the learner about streak / daily-mission progress returned by the server. */
export function announcePlay(play) {
  if (!play) return;
  const toast = useUI.getState().toast;
  if (play.missionDone) toast(`🎯 Daily mission done! +${play.bonusXp} XP`, 'success');
  if (play.streakUp && play.streak > 1) toast(`🔥 ${play.streak}-day streak! Keep it going tomorrow.`, 'success');
  else if (play.streakUp && play.streak === 1) toast('🔥 Streak started! Come back tomorrow to grow it.', 'success');
}

/** Read text aloud with the browser's built-in, free speech engine (no account, works offline). */
export const speech = {
  supported: typeof window !== 'undefined' && 'speechSynthesis' in window,
  say(text, { rate = 1 } = {}) {
    if (!this.supported) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = rate;
    window.speechSynthesis.speak(u);
  },
  stop() {
    if (this.supported) window.speechSynthesis.cancel();
  },
};
