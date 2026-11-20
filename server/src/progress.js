import { db } from './db.js';
import { BADGES } from './seed.js';
import { applyActivity, levelInfo } from './play/rules.js';

/** Award XP and any new badges; returns the list of newly earned badge keys. */
export async function reward(user, { xp = 0, badges = [] }) {
  const fresh = badges.filter((b) => BADGES[b] && !user.badges.includes(b));
  await db.update('users', user.id, {
    xp: (user.xp || 0) + xp,
    badges: [...user.badges, ...fresh],
  });
  return fresh.map((key) => ({ key, ...BADGES[key] }));
}

export function levelFor(xp = 0) {
  return levelInfo(xp).level;
}

/**
 * Records a learning activity for streaks and the daily mission.
 * Returns a small summary the client shows as a toast ("🔥 3-day streak", "Mission done +15 XP").
 */
export async function activity(user, kind) {
  const r = applyActivity(user, kind);
  await db.update('users', user.id, r.patch);
  const newBadges = await reward(user, { xp: r.bonusXp, badges: r.streak.count >= 7 ? ['streak-7'] : [] });
  return { streak: r.streak.count, streakUp: r.streakUp, missionDone: r.missionJustDone, bonusXp: r.bonusXp, newBadges };
}
