// Partner Guard agent (rules first, zero tokens).
// In Partner mode everything a learner makes must promote the partner company. The guard
// builds the partner's vocabulary from the company brief (name, public label, website,
// hashtags, products, key words) and checks requests, designs, videos and AI results:
//   strong    → names the partner (name, label, website or hashtag)          → allowed
//   related   → at least two partner topic words                              → allowed
//   ambiguous → one partner topic word                                        → allowed with a hint
//               (the Director may ask a small AI model, only when one is configured)
//   off-topic → nothing about the partner                                     → blocked
// Pure JS: runs in the browser (instant feedback) and on the server (enforcement).

const STOP = new Set(('about above after again against all also always among and another any are around because been before being below between both but can could did does doing down during each even every from further get gets got had has have having here how into its itself just like make made more most much must near need never next not now off once only other our ours out over own per really same should since some such than that the their theirs them then there these they this those through too under until upon very was were what when where which while who whom why will with within without would you your yours really thing things stuff great best good new top made make makes help helps people use uses using want wants every simple easy free').split(' '));

// "my lemonade stand", "our dog-walking service", "my own bakery"… (up to 3 words between)
const OWN_BUSINESS = /\b(?:my|our)\s+(?:[\w'-]+\s+){0,3}?(?:business|shop|store|company|brand|startup|products?|services?|bakery|stand|channel|band|app|website|side hustle|candles?|cookies|cakes?|crafts?|art|salon|studio|restaurant|cafe|café|class(?:es)?|lessons?|clothing|jewel(?:le)?ry|bracelets?|scarves|soap)\b/i;

const norm = (s) => String(s || '').toLowerCase();
const tokens = (s) => norm(s).match(/[a-z0-9][a-z0-9'-]{2,}/g) || [];
// "gifts" and "gift" are the same topic
const stem = (w) => (w.length > 4 && w.endsWith('s') && !w.endsWith('ss') ? w.slice(0, -1) : w);

/** The words and names that count as "about the partner". */
export function partnerVocabulary(brief = {}) {
  const names = [brief.name, brief.displayName].filter(Boolean).map(norm);
  let domain = '';
  try {
    domain = brief.website ? new URL(brief.website).hostname.replace(/^www\./, '') : '';
  } catch { /* ignore bad url */ }
  const domainRoot = domain.split('.')[0] || '';
  const hashtags = (String(brief.hashtags || '').match(/#\w+/g) || []).map(norm);
  // compact name: "Nexa Edits" -> "nexaedits"
  const compact = names.map((n) => n.replace(/[^a-z0-9]/g, '')).filter((n) => n.length >= 4);
  const strong = [...new Set([...names, ...compact, domain, domainRoot.length >= 4 ? domainRoot : '', ...hashtags].filter(Boolean))];
  const topicSource = [brief.description, brief.products, brief.keyMessages, brief.tagline, brief.audience].join(' ');
  const counts = {};
  for (const t of tokens(topicSource)) if (t.length >= 4 && !STOP.has(t)) counts[stem(t)] = (counts[stem(t)] || 0) + 1;
  const topics = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 40).map(([t]) => t);
  return { strong, topics };
}

/** Is this content about the partner? `texts` can be strings or arrays of strings. */
export function checkRelevance(texts, brief) {
  const text = norm([texts].flat(3).filter(Boolean).join(' \n '));
  const vocab = partnerVocabulary(brief);
  const label = brief.displayName || 'the partner website';
  if (!text.trim()) return { ok: false, level: 'off-topic', hits: [], message: `Add something about ${label} first.` };
  const strongHits = vocab.strong.filter((w) => text.includes(w));
  if (strongHits.length) return { ok: true, level: 'strong', hits: strongHits, message: '' };
  const words = new Set(tokens(text).map(stem));
  const topicHits = vocab.topics.filter((t) => words.has(t));
  if (topicHits.length >= 2) return { ok: true, level: 'related', hits: topicHits, message: '' };
  if (topicHits.length === 1) {
    return { ok: true, level: 'ambiguous', hits: topicHits, message: `Tip: mention ${label} by name so people know who you're promoting.` };
  }
  return {
    ok: false,
    level: 'off-topic',
    hits: [],
    message: `In Partner mode, everything you make must promote ${label}. Add its name, website or one of its products (for example: ${vocab.topics.slice(0, 3).join(', ') || 'what it offers'}).`,
  };
}

/** Checks a request (prompt / tool inputs) before any work is done. */
export function checkRequest(text, brief) {
  const t = String(text || '');
  const rel = checkRelevance(t, brief);
  if (OWN_BUSINESS.test(t) && rel.level !== 'strong') {
    return { ok: false, level: 'own-business', hits: [], message: `Right now the Lab only makes content for ${brief.displayName || 'the partner website'}. Earn your Ambassador certificate to unlock your own brand.` };
  }
  return { ok: true, level: rel.level, hits: rel.hits, message: '' };
}

/** All visible words in a Design Studio document. */
export const docText = (doc) => (doc?.elements ?? []).filter((e) => e.type === 'text').map((e) => e.text);
/** All on-screen words in Video Maker scenes. */
export const scenesText = (scenes) => (scenes ?? []).flatMap((s) => [s.text, s.subtext]);
