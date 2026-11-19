// Regenerates section 1 of docs/SOURCES.md from the lesson files (keeps sections 2+ as they are).
// Run: node scripts/gen-sources.mjs
import fs from 'node:fs';
const { LESSONS } = await import('../server/src/seed.js');
const { EXTRA_LESSONS } = await import('../server/src/lessons-extra.js');
const { PRO_LESSONS } = await import('../server/src/lessons-pro.js');
const { MONTH_LESSONS } = await import('../server/src/lessons-month.js');
const lessons = [...LESSONS, ...EXTRA_LESSONS, ...PRO_LESSONS, ...MONTH_LESSONS];

const GROUPS = [
  [/ftc\.gov/, 'FTC (U.S. Federal Trade Commission)'],
  [/analytics\.google|marketingplatform\.google/, 'Google Analytics tools'],
  [/developers\.google\.com\/search/, 'Google Search Central'],
  [/support\.google\.com/, 'Google Help Center'],
  [/google|youtube/, 'Google: Think with Google / Google Business'],
  [/hbr\.org|hbs\.edu/, 'Harvard Business Review & Harvard Business School'],
  [/nngroup\.com/, 'Nielsen Norman Group (usability research)'],
  [/sba\.gov/, 'SBA (U.S. Small Business Administration)'],
  [/score\.org/, 'SCORE (SBA resource partner)'],
  [/usda\.gov/, 'USDA (U.S. Department of Agriculture)'],
  [/w3\.org/, 'W3C Web Accessibility Initiative'],
  [/./, 'Other'],
];
const byUrl = new Map();
for (const l of lessons) for (const s of l.sources) {
  const e = byUrl.get(s.url) ?? { ...s, used: [] };
  if (!e.used.includes(l.title)) e.used.push(l.title);
  byUrl.set(s.url, e);
}
const groups = new Map();
for (const e of byUrl.values()) {
  const g = GROUPS.find(([re]) => re.test(e.url))[1];
  if (!groups.has(g)) groups.set(g, []);
  groups.get(g).push(e);
}
let out = `## 1. Sources used in lessons (${byUrl.size} links, ${lessons.length} lessons)\n`;
for (const [, name] of GROUPS) {
  const list = groups.get(name);
  if (!list) continue;
  out += `\n### ${name}\n\n`;
  for (const e of list) out += `- [${e.title}](${e.url})  \n  Used in: ${e.used.join('; ')}\n`;
}
const path = new URL('../docs/SOURCES.md', import.meta.url);
const doc = fs.readFileSync(path, 'utf8');
const start = doc.indexOf('## 1.');
const end = doc.indexOf('## 2.');
fs.writeFileSync(path, doc.slice(0, start) + out + '\n' + doc.slice(end));
console.log(`SOURCES.md: ${byUrl.size} links across ${lessons.length} lessons`);
