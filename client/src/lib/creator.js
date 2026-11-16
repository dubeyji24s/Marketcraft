// Creator: turns a plain-language description into finished, editable designs.
// Free and offline: it reads the request (format, occasion, mood, colours, details) and
// composes layouts from Marketcraft's design system. An optional free AI picture can be
// added (see aiPicture), which is the only part that uses the internet.
import { PRESETS } from '../components/DesignEditor.jsx';

const uid = () => Math.random().toString(36).slice(2, 9);
const cap = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s);

// ---- understanding the request ---------------------------------------------------------
const FORMAT_WORDS = [
  [/\b(video|reel|tiktok|short|clip|animation)\b/i, 'video'],
  [/\b(story|stories)\b/i, 'story'],
  [/\b(flyer|leaflet|handout|printable)\b/i, 'flyer'],
  [/\b(poster|sign)\b/i, 'poster'],
  [/\b(thumbnail|youtube)\b/i, 'thumbnail'],
  [/\b(banner|facebook|twitter|x post|linkedin|cover|header)\b/i, 'social-wide'],
  [/\b(instagram|post|square|feed)\b/i, 'instagram-post'],
];

const OCCASIONS = [
  ['sale', /\b(sale|discount|% ?off|deal|offer|clearance|bogo|promo|coupon)\b/i],
  ['giveaway', /\b(giveaway|contest|win|raffle|sweepstake)\b/i],
  ['event', /\b(event|party|workshop|class|opening|pop-?up|market|fair|meetup|concert|festival|invite|invitation|webinar)\b/i],
  ['launch', /\b(launch|new|introducing|coming soon|announc|release|debut)\b/i],
  ['hiring', /\b(hiring|job|we'?re looking|join our team|recruit)\b/i],
  ['thanks', /\b(thank|grateful|appreciat)\b/i],
  ['tip', /\b(tip|how to|guide|advice|hack|tutorial)\b/i],
];

// palette = [background, background2, ink (main text), accent, soft]
const PALETTES = {
  candy: ['#ff3d81', '#ffd23f', '#ffffff', '#1b0b3a', '#fff0f6'],
  sunny: ['#ffd23f', '#ff8a3d', '#1b0b3a', '#ffffff', '#fff7d6'],
  ocean: ['#0ea5e9', '#22d3ee', '#ffffff', '#082f49', '#e0f2fe'],
  icy: ['#e0f2fe', '#a5b4fc', '#1e1b4b', '#2563eb', '#ffffff'],
  forest: ['#14532d', '#22c55e', '#ffffff', '#facc15', '#ecfdf5'],
  luxe: ['#0b0b0f', '#2a2116', '#f5d58a', '#ffffff', '#1a1a22'],
  neon: ['#0b1023', '#6b5bff', '#ffffff', '#3dd6ff', '#141a3a'],
  minimal: ['#f5f2ec', '#ffffff', '#111827', '#ff3d81', '#ffffff'],
  sunset: ['#ff8a3d', '#ff3d81', '#ffffff', '#1b0b3a', '#fff1e6'],
  berry: ['#7c3aed', '#db2777', '#ffffff', '#fde047', '#f5f3ff'],
  spooky: ['#111827', '#f97316', '#fed7aa', '#f97316', '#1f2937'],
  festive: ['#991b1b', '#166534', '#fff7ed', '#facc15', '#fef2f2'],
  love: ['#fb7185', '#f9a8d4', '#ffffff', '#881337', '#fff1f2'],
};
const MOOD_WORDS = [
  [/\b(kid|kids|fun|playful|bright|colou?rful|happy|candy)\b/i, 'candy'],
  [/\b(summer|sunny|lemonade|beach|tropical)\b/i, 'sunny'],
  [/\b(ocean|sea|water|fresh|clean|cool)\b/i, 'ocean'],
  [/\b(winter|snow|ice|icy|frozen)\b/i, 'icy'],
  [/\b(eco|green|nature|organic|plant|garden|earth)\b/i, 'forest'],
  [/\b(luxury|luxe|elegant|premium|gold|classy|fancy)\b/i, 'luxe'],
  [/\b(tech|modern|futur|neon|gaming|app|digital)\b/i, 'neon'],
  [/\b(minimal|simple|calm|clean|professional|corporate)\b/i, 'minimal'],
  [/\b(sunset|warm|cozy|autumn|fall)\b/i, 'sunset'],
  [/\b(halloween|spooky)\b/i, 'spooky'],
  [/\b(christmas|holiday|festive|xmas)\b/i, 'festive'],
  [/\b(valentine|love|romantic)\b/i, 'love'],
  [/\b(purple|bold|vibrant)\b/i, 'berry'],
];
const COLOR_NAMES = { red: '#ef4444', orange: '#f97316', yellow: '#facc15', gold: '#f5d58a', green: '#22c55e', teal: '#14b8a6', blue: '#2563eb', navy: '#1e3a8a', purple: '#7c3aed', pink: '#ec4899', black: '#0b0b0f', white: '#ffffff', brown: '#92400e', grey: '#6b7280', gray: '#6b7280' };
const DARK = new Set(['red', 'green', 'teal', 'blue', 'navy', 'purple', 'black', 'brown', 'grey', 'gray', 'pink', 'orange']);

const HEADLINES = {
  sale: ['{offer}', 'Big {brand} Sale', 'Treat yourself', 'Deals you\'ll love'],
  giveaway: ['Giveaway time!', 'Win something special', 'Enter to win'],
  event: ['You\'re invited', 'Join us!', '{subject}', 'Save the date'],
  launch: ['Just launched', 'Meet the new {subject}', 'Something new is here', 'Coming soon'],
  hiring: ['We\'re hiring!', 'Join our team', 'Work with us'],
  thanks: ['Thank you!', 'We appreciate you', 'Grateful for you'],
  tip: ['Quick tip', '{subject}', 'Try this today'],
  general: ['{subject}', 'Discover {brand}', 'Made for you', 'Say hello to {brand}'],
};
const CTAS = { sale: 'Shop now', giveaway: 'Enter now', event: 'See you there', launch: 'Learn more', hiring: 'Apply today', thanks: 'Follow along', tip: 'Save this post', general: 'Find out more' };

export function understand(prompt, brandName = '') {
  const p = String(prompt || '');
  const quoted = p.match(/["“]([^"”]{2,80})["”]/)?.[1];
  const format = FORMAT_WORDS.find(([re]) => re.test(p))?.[1] ?? 'instagram-post';
  const occasion = OCCASIONS.find(([, re]) => re.test(p))?.[0] ?? 'general';
  const colors = Object.keys(COLOR_NAMES).filter((c) => new RegExp(`\\b${c}\\b`, 'i').test(p));
  const moods = MOOD_WORDS.filter(([re]) => re.test(p)).map(([, m]) => m);
  const forMatch = p.match(/\bfor (?:my |our |the )?([A-Z][\w'&.-]*(?: [A-Z][\w'&.-]*){0,3})/);
  const brand = brandName || forMatch?.[1] || '';
  const percent = p.match(/(\d{1,2}) ?% ?off/i)?.[0];
  const price = p.match(/\$\s?\d+(?:\.\d{2})?/)?.[0];
  const day = p.match(/\b(mon|tues|wednes|thurs|fri|satur|sun)day\b/i)?.[0];
  const date = p.match(/\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]* \d{1,2}(?:st|nd|rd|th)?\b/i)?.[0];
  const time = p.match(/\b\d{1,2}(?::\d{2})? ?(?:am|pm)(?: ?[-–to]+ ?\d{1,2}(?::\d{2})? ?(?:am|pm))?/i)?.[0];
  const place = p.match(/\b(?:at|in) (the [\w' ]{3,30}?|[A-Z][\w' ]{2,30}?)(?=[,.!]| on | from |$)/)?.[1];
  // subject: the thing being promoted ("a flyer for my lemonade stand" -> "lemonade stand")
  const subject = (p.match(/\b(?:for|about|promoting|advertis\w*) (?:my |our |a |an |the )?([a-z][\w' -]{2,40}?)(?=[,.!]| with | that | on | in | at | for |$)/i)?.[1] || brand || 'our brand').trim();
  // "for my lemonade stand summer sale" names the business: prefer it over the saved brand
  const own = p.match(/\bfor (?:my|our) ([a-z][\w' -]{2,40}?)(?=[,.!]| with | that | on | in | at | for |$)/i)?.[1]
    ?.replace(/\b(summer|winter|spring|fall|autumn|holiday|grand|big|new)?\s*(sale|event|launch|opening|pop-?up|flyer|post|story|poster|video|giveaway|promo|ad)s?\b.*$/i, '').trim();
  const named = own && own.length > 2 ? own.split(' ').map(cap).join(' ') : '';
  return { prompt: p, quoted, format, occasion, colors, moods, brand: named || brand || subject, subject: named || subject, offer: percent || price, when: [day, date, time].filter(Boolean).join(' · '), place };
}

function paletteFor(r, k) {
  if (r.colors.length) {
    // dark colours make good backgrounds, light ones good text/accents; alternate for variety
    const dark = r.colors.filter((c) => DARK.has(c)).map((c) => COLOR_NAMES[c]);
    const light = r.colors.filter((c) => !DARK.has(c)).map((c) => COLOR_NAMES[c]);
    if (dark.length && light.length) {
      return k % 2 === 0
        ? [dark[0], dark[1] ?? dark[0], light[0], light[0], '#ffffff22']
        : [light[0], light[1] ?? light[0], '#111827', dark[0], '#ffffffcc'];
    }
    const [a, b = a] = r.colors;
    const bg = COLOR_NAMES[a], bg2 = COLOR_NAMES[b];
    const ink = DARK.has(a) ? '#ffffff' : '#111827';
    const accent = COLOR_NAMES[r.colors[2]] || (DARK.has(a) ? '#facc15' : '#1b0b3a');
    return [bg, bg2, ink, accent, DARK.has(a) ? '#ffffff22' : '#ffffffcc'];
  }
  const moods = r.moods.length ? r.moods : ({ sale: ['candy', 'sunset'], event: ['berry', 'ocean'], launch: ['neon', 'minimal'], giveaway: ['candy', 'berry'], thanks: ['love', 'sunny'], tip: ['minimal', 'forest'], hiring: ['ocean', 'minimal'] }[r.occasion] || ['candy', 'neon', 'minimal']);
  const order = [...moods, 'minimal', 'neon', 'sunset', 'ocean', 'berry', 'candy'];
  return PALETTES[order[k % order.length]];
}

function words(r) {
  const fill = (t) => t.replace('{brand}', r.brand).replace('{subject}', cap(r.subject)).replace('{offer}', r.offer ? `${r.offer.toUpperCase()}` : 'Big Sale');
  const heads = r.quoted ? [r.quoted, ...HEADLINES[r.occasion].map(fill)] : HEADLINES[r.occasion].map(fill);
  const detail = [r.when, r.place].filter(Boolean).join('\n') || (r.offer && r.occasion !== 'sale' ? r.offer : '');
  const sub = {
    sale: r.offer ? `on everything at ${r.brand}` : `Limited time at ${r.brand}`,
    giveaway: `Follow ${r.brand} and tag a friend to enter`,
    event: `Hosted by ${r.brand}`,
    launch: `From ${r.brand}`,
    hiring: `${r.brand} is growing`,
    thanks: `From everyone at ${r.brand}`,
    tip: `From ${r.brand}`,
    general: cap(r.subject) === r.brand ? 'Made with care' : `by ${r.brand}`,
  }[r.occasion];
  return { heads, sub, detail, cta: CTAS[r.occasion] };
}

// ---- layouts ----------------------------------------------------------------------------
const T = (o) => ({ id: uid(), type: 'text', fontFamily: 'Outfit', fontWeight: 800, align: 'left', lineHeight: 1.08, opacity: 1, h: 100, ...o });
const R = (o) => ({ id: uid(), type: 'rect', radius: 0, opacity: 1, ...o });
const C = (o) => ({ id: uid(), type: 'circle', opacity: 1, ...o });
const fit = (text, base, ideal) => (text && text.length > ideal ? Math.round(base * Math.max(0.45, Math.sqrt(ideal / text.length))) : base);

const DISPLAY = ['Outfit', 'Bebas Neue', 'Playfair Display', 'Fredoka', 'Outfit', 'Pacifico'];

/** Each layout gets (W, H, palette, text, font) and returns elements + background. */
const LAYOUTS = [
  function boldCenter(W, H, [bg, bg2, ink, accent], t, font) {
    const u = Math.min(W, H);
    return { background: { type: 'gradient', color: bg, color2: bg2, angle: 150 }, elements: [
      C({ x: W * 0.62, y: -u * 0.12, w: u * 0.55, h: u * 0.55, fill: '#ffffff', opacity: 0.16 }),
      C({ x: -u * 0.18, y: H - u * 0.4, w: u * 0.5, h: u * 0.5, fill: accent, opacity: 0.18 }),
      T({ x: W * 0.08, y: H * 0.16, w: W * 0.84, text: t.brand.toUpperCase(), fontFamily: 'Bebas Neue', fontWeight: 400, fontSize: Math.round(u * 0.06), color: ink, align: 'center', opacity: 0.85 }),
      T({ x: W * 0.08, y: H * 0.28, w: W * 0.84, text: t.head, fontFamily: font, fontWeight: font === 'Bebas Neue' || font === 'Pacifico' ? 400 : 800, fontSize: fit(t.head, Math.round(u * 0.14), 14), color: ink, align: 'center' }),
      T({ x: W * 0.12, y: H * 0.58, w: W * 0.76, text: [t.sub, t.detail].filter(Boolean).join('\n'), fontWeight: 600, fontSize: Math.round(u * 0.042), color: ink, align: 'center', lineHeight: 1.35, opacity: 0.9 }),
      R({ x: W * 0.27, y: H * 0.8, w: W * 0.46, h: u * 0.11, fill: accent, radius: u * 0.055 }),
      T({ x: W * 0.27, y: H * 0.8 + u * 0.028, w: W * 0.46, text: t.cta, fontWeight: 800, fontSize: fit(t.cta, Math.round(u * 0.045), 12), color: bg, align: 'center' }),
    ] };
  },
  function splitBlock(W, H, [bg, bg2, ink, accent, soft], t, font) {
    const u = Math.min(W, H);
    const tall = H > W;
    return { background: { type: 'solid', color: soft.length > 7 ? '#ffffff' : soft }, elements: [
      R({ x: 0, y: 0, w: tall ? W : W * 0.5, h: tall ? H * 0.46 : H, fill: bg }),
      T({ x: W * 0.07, y: tall ? H * 0.08 : H * 0.12, w: tall ? W * 0.86 : W * 0.38, text: t.brand.toUpperCase(), fontFamily: 'Bebas Neue', fontWeight: 400, fontSize: Math.round(u * 0.055), color: ink }),
      T({ x: W * 0.07, y: tall ? H * 0.16 : H * 0.26, w: tall ? W * 0.86 : W * 0.38, text: t.head, fontFamily: font, fontWeight: font === 'Bebas Neue' || font === 'Pacifico' ? 400 : 800, fontSize: fit(t.head, Math.round(u * (tall ? 0.13 : 0.1)), 14), color: ink }),
      T({ x: tall ? W * 0.07 : W * 0.56, y: tall ? H * 0.52 : H * 0.22, w: tall ? W * 0.86 : W * 0.38, text: [t.sub, t.detail].filter(Boolean).join('\n'), fontWeight: 600, fontSize: Math.round(u * 0.045), color: '#1f2937', lineHeight: 1.4 }),
      R({ x: tall ? W * 0.07 : W * 0.56, y: tall ? H * 0.84 : H * 0.7, w: tall ? W * 0.6 : W * 0.34, h: u * 0.1, fill: accent === '#ffffff' ? bg2 : accent, radius: u * 0.02 }),
      T({ x: tall ? W * 0.07 : W * 0.56, y: (tall ? H * 0.84 : H * 0.7) + u * 0.026, w: tall ? W * 0.6 : W * 0.34, text: t.cta, fontWeight: 800, fontSize: fit(t.cta, Math.round(u * 0.042), 12), color: '#ffffff', align: 'center' }),
    ] };
  },
  function bigWord(W, H, [bg, bg2, ink, accent], t) {
    const u = Math.min(W, H);
    const big = (t.offer || t.head.split(' ')[0] || 'NEW').toUpperCase();
    return { background: { type: 'solid', color: bg }, elements: [
      T({ x: W * 0.05, y: H * 0.1, w: W * 0.9, text: big, fontFamily: 'Bebas Neue', fontWeight: 400, fontSize: fit(big, Math.round(u * 0.36), 5), color: accent, align: 'center', lineHeight: 0.95 }),
      T({ x: W * 0.08, y: H * 0.5, w: W * 0.84, text: t.head === big ? t.sub : t.head, fontWeight: 800, fontSize: fit(t.head, Math.round(u * 0.075), 20), color: ink, align: 'center' }),
      T({ x: W * 0.1, y: H * 0.68, w: W * 0.8, text: [t.detail || t.sub, t.brand].filter(Boolean).join(' · '), fontWeight: 600, fontSize: Math.round(u * 0.038), color: ink, align: 'center', opacity: 0.85, lineHeight: 1.35 }),
      R({ x: W * 0.3, y: H * 0.84, w: W * 0.4, h: u * 0.09, fill: ink, radius: u * 0.045 }),
      T({ x: W * 0.3, y: H * 0.84 + u * 0.022, w: W * 0.4, text: t.cta, fontWeight: 800, fontSize: fit(t.cta, Math.round(u * 0.04), 12), color: bg, align: 'center' }),
    ] };
  },
  function framedCard(W, H, [bg, bg2, ink, accent, soft], t, font) {
    const u = Math.min(W, H);
    const m = u * 0.07;
    return { background: { type: 'gradient', color: bg, color2: bg2, angle: 120 }, elements: [
      R({ x: m, y: m, w: W - 2 * m, h: H - 2 * m, fill: '#ffffff', radius: u * 0.04, opacity: 0.95 }),
      T({ x: m * 2, y: m * 2, w: W - 4 * m, text: t.brand, fontFamily: 'Pacifico', fontWeight: 400, fontSize: Math.round(u * 0.055), color: bg, align: 'center' }),
      T({ x: m * 2, y: H * 0.3, w: W - 4 * m, text: t.head, fontFamily: font === 'Pacifico' ? 'Outfit' : font, fontWeight: font === 'Bebas Neue' ? 400 : 800, fontSize: fit(t.head, Math.round(u * 0.11), 16), color: '#111827', align: 'center' }),
      T({ x: m * 2, y: H * 0.58, w: W - 4 * m, text: [t.sub, t.detail].filter(Boolean).join('\n'), fontWeight: 500, fontSize: Math.round(u * 0.04), color: '#374151', align: 'center', lineHeight: 1.4 }),
      T({ x: m * 2, y: H - m * 2 - u * 0.07, w: W - 4 * m, text: `${t.cta} →`, fontWeight: 800, fontSize: fit(t.cta, Math.round(u * 0.048), 12), color: bg, align: 'center' }),
    ] };
  },
  function minimalType(W, H, [bg, bg2, ink, accent, soft], t) {
    const u = Math.min(W, H);
    return { background: { type: 'solid', color: '#f5f2ec' }, elements: [
      R({ x: W * 0.08, y: H * 0.1, w: u * 0.12, h: u * 0.018, fill: bg }),
      T({ x: W * 0.08, y: H * 0.15, w: W * 0.84, text: t.head, fontFamily: 'Playfair Display', fontWeight: 700, fontSize: fit(t.head, Math.round(u * 0.12), 16), color: '#111827', lineHeight: 1.05 }),
      T({ x: W * 0.08, y: H * 0.55, w: W * 0.7, text: [t.sub, t.detail].filter(Boolean).join('\n'), fontWeight: 500, fontSize: Math.round(u * 0.04), color: '#374151', lineHeight: 1.4 }),
      T({ x: W * 0.08, y: H * 0.86, w: W * 0.5, text: t.brand, fontWeight: 800, fontSize: Math.round(u * 0.04), color: bg }),
      T({ x: W * 0.5, y: H * 0.86, w: W * 0.42, text: `${t.cta} →`, fontWeight: 700, fontSize: fit(t.cta, Math.round(u * 0.04), 12), color: '#111827', align: 'right' }),
    ] };
  },
  function badge(W, H, [bg, bg2, ink, accent], t, font) {
    const u = Math.min(W, H);
    const d = u * 0.62;
    return { background: { type: 'gradient', color: bg2, color2: bg, angle: 200 }, elements: [
      C({ x: (W - d) / 2, y: H * 0.14, w: d, h: d, fill: accent, opacity: 0.95 }),
      C({ x: (W - d * 0.86) / 2, y: H * 0.14 + d * 0.07, w: d * 0.86, h: d * 0.86, fill: bg, opacity: 0.95 }),
      T({ x: (W - d * 0.76) / 2, y: H * 0.14 + d * 0.3, w: d * 0.76, text: t.head, fontFamily: font, fontWeight: font === 'Bebas Neue' || font === 'Pacifico' ? 400 : 800, fontSize: fit(t.head, Math.round(d * 0.16), 12), color: ink, align: 'center' }),
      T({ x: W * 0.08, y: H * 0.14 + d + u * 0.05, w: W * 0.84, text: [t.sub, t.detail].filter(Boolean).join(' · '), fontWeight: 600, fontSize: Math.round(u * 0.04), color: ink, align: 'center', lineHeight: 1.35 }),
      T({ x: W * 0.08, y: H * 0.88, w: W * 0.84, text: `${t.cta} · ${t.brand}`, fontWeight: 800, fontSize: fit(t.cta, Math.round(u * 0.038), 20), color: ink, align: 'center' }),
    ] };
  },
];

/** Create `count` design options for a request. */
export function createDesigns(prompt, { brand = '', format = 'auto', count = 6 } = {}) {
  const r = understand(prompt, brand);
  const preset = format !== 'auto' && PRESETS[format] ? format : r.format === 'video' ? 'instagram-post' : r.format;
  const { w: W, h: H } = PRESETS[preset];
  const wd = words(r);
  const results = [];
  for (let k = 0; k < count; k++) {
    const layout = LAYOUTS[k % LAYOUTS.length];
    const palette = paletteFor(r, k);
    const font = DISPLAY[(k + r.prompt.length) % DISPLAY.length];
    const head = wd.heads[k % wd.heads.length];
    const out = layout(W, H, palette, { brand: r.brand, head, sub: wd.sub, detail: wd.detail, cta: wd.cta, offer: r.offer }, font);
    const round = (e) => Object.fromEntries(Object.entries(e).map(([key, v]) => [key, typeof v === 'number' && ['x', 'y', 'w', 'h', 'fontSize', 'radius'].includes(key) ? Math.round(v) : v]));
    results.push({ name: `${cap(r.occasion === 'general' ? 'Design' : r.occasion)} · option ${k + 1}`, doc: { preset, width: W, height: H, background: out.background, elements: out.elements.map(round) } });
  }
  return { understood: r, preset, results };
}

/** Video scenes from the same request. */
export function createVideoScenes(prompt, { brand = '' } = {}) {
  const r = understand(prompt, brand);
  const wd = words(r);
  const styles = { candy: 'confetti', sunny: 'sunset', ocean: 'waves', icy: 'bokeh', forest: 'waves', luxe: 'particles', neon: 'stripes', minimal: 'aurora', sunset: 'sunset', berry: 'aurora', spooky: 'particles', festive: 'confetti', love: 'bokeh' };
  const bg = styles[r.moods[0]] || 'aurora';
  const scene = (text, subtext, style, duration = 2.5) => ({ id: uid(), duration, bg: { kind: 'animated', style }, text, subtext, color: '#ffffff', position: 'center', font: 'Outfit' });
  return [
    scene(wd.heads[0], r.brand, bg, 2.5),
    scene(wd.sub, '', 'particles', 2.5),
    ...(wd.detail ? [scene(wd.detail.replace('\n', ' · '), '', 'bokeh', 2.5)] : []),
    scene(wd.cta, r.brand, bg === 'sunset' ? 'aurora' : 'sunset', 3),
  ];
}

// ---- optional free AI picture ---------------------------------------------------------
const BLOCKED = /\b(nude|naked|sex|porn|gore|blood|kill|weapon|gun|drug|hate)\b/i;

/**
 * Generate a picture with the free Pollinations service (no key; rate-limited, best effort).
 * Returns a data: URL so it can be edited and exported like any uploaded photo.
 */
export async function aiPicture(prompt, { width = 768, height = 768 } = {}) {
  if (BLOCKED.test(prompt)) throw new Error('Please describe a family-friendly picture.');
  const clean = `${prompt}, professional product photography, soft light, no text, no words, family friendly`;
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(clean)}?width=${width}&height=${height}&nologo=true&safe=true&seed=${Math.floor(Math.random() * 1e6)}`;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 60000);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) throw new Error(res.status === 429 ? 'The free picture service is busy. Wait 15 seconds and try again.' : 'The free picture service did not answer. Try again in a moment.');
    const blob = await res.blob();
    if (!blob.type.startsWith('image/')) throw new Error('The free picture service returned no image.');
    return await new Promise((ok) => { const fr = new FileReader(); fr.onload = () => ok(fr.result); fr.readAsDataURL(blob); });
  } catch (e) {
    if (e.name === 'AbortError') throw new Error('The free picture service took too long. Try again.');
    if (e instanceof TypeError) throw new Error('AI pictures are not available here (no internet access to the picture service).');
    throw e;
  } finally {
    clearTimeout(timer);
  }
}

/** Put a picture behind a design: darkened photo, big colour blocks removed, text made readable. */
export function withPicture(result, dataUrl) {
  const doc = structuredClone(result.doc);
  const { width: W, height: H } = doc;
  const img = { id: uid(), type: 'image', x: 0, y: 0, w: W, h: H, src: dataUrl, radius: 0, opacity: 1 };
  const tint = { id: uid(), type: 'rect', x: 0, y: 0, w: W, h: H, fill: '#000000', radius: 0, opacity: 0.38 };
  // keep small shapes (buttons, badges); drop big blocks and decorations that would hide the photo
  const shapes = doc.elements.filter((e) => e.type === 'rect' && e.w * e.h < W * H * 0.2);
  const onShape = (t) => shapes.some((r) => t.x + t.w / 2 > r.x && t.x + t.w / 2 < r.x + r.w && t.y > r.y - 10 && t.y < r.y + r.h);
  const texts = doc.elements.filter((e) => e.type === 'text').map((t) => (onShape(t) ? t : { ...t, color: '#ffffff' }));
  doc.background = { type: 'solid', color: '#000000' };
  doc.elements = [img, tint, ...shapes, ...texts];
  return doc;
}
