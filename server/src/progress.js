import { db } from './db.js';
import { BADGES } from './seed.js';

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
  return Math.floor(Math.sqrt(xp / 50)) + 1;
}
