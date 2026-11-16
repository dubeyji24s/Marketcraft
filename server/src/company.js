// Partner-company brief (edited by admins) + helpers shared by the Ambassador Program.
import { db } from './db.js';
import { config } from './config.js';

export const BRIEF_FIELDS = ['displayName', 'name', 'website', 'tagline', 'description', 'products', 'audience', 'keyMessages', 'offers', 'voice', 'dos', 'donts', 'hashtags'];

// The partner company is shown to learners only by its public label (default "Partner Website").
// Its real name and facts stay in the admin-only brief and are given to the AI tools as facts.
export const DEFAULT_DISPLAY_NAME = 'Partner Website';
const DEFAULT_BRIEF = { ...Object.fromEntries(BRIEF_FIELDS.map((k) => [k, ''])), displayName: DEFAULT_DISPLAY_NAME, name: process.env.COMPANY_NAME || '' };

export function getBrief() {
  const doc = db.find('settings', (s) => s.key === 'companyBrief');
  const brief = { ...DEFAULT_BRIEF, ...(doc?.value ?? {}) };
  if (!brief.website) brief.website = config.companyUrl;
  if (!brief.displayName) brief.displayName = DEFAULT_DISPLAY_NAME;
  return brief;
}

export async function saveBrief(value) {
  const doc = db.find('settings', (s) => s.key === 'companyBrief');
  if (doc) return (await db.update('settings', doc.id, { value })).value;
  return (await db.insert('settings', { key: 'companyBrief', value })).value;
}

/** Personal tracking link: the company site can read ?ref= to credit the ambassador. */
export function referralLink(brief, code) {
  if (!brief.website || !code) return '';
  try {
    const u = new URL(brief.website);
    u.searchParams.set('ref', code);
    u.searchParams.set('utm_source', 'marketcraft');
    u.searchParams.set('utm_medium', 'ambassador');
    u.searchParams.set('utm_campaign', code);
    return u.toString();
  } catch {
    return '';
  }
}

/** Fill {company} placeholders in ambassador challenges. */
export function personalizeChallenge(c, brief = getBrief()) {
  if (c.kind !== 'ambassador') return c;
  const name = brief.displayName || DEFAULT_DISPLAY_NAME;
  const fill = (s) => (typeof s === 'string' ? s.replaceAll('{company}', name) : s);
  return { ...c, title: fill(c.title), product: fill(c.product), brief: fill(c.brief), certificateBadge: fill(c.certificateBadge) };
}
