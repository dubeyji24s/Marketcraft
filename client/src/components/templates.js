// Free Marketcraft templates (original designs). Each takes the learner's words, so AI
// results can drop straight in: { brand, headline, body, cta, tagline, hashtags }.
const uid = () => Math.random().toString(36).slice(2, 9);
const T = (o) => ({ id: uid(), type: 'text', x: 80, y: 80, w: 900, h: 120, text: '', fontFamily: 'Outfit', fontSize: 72, fontWeight: 800, color: '#ffffff', align: 'left', lineHeight: 1.12, opacity: 1, ...o });
const R = (o) => ({ id: uid(), type: 'rect', x: 0, y: 0, w: 100, h: 100, fill: '#ff3d81', radius: 0, opacity: 1, ...o });
const C = (o) => ({ id: uid(), type: 'circle', x: 0, y: 0, w: 200, h: 200, fill: '#ffd23f', opacity: 1, ...o });
const doc = (preset, width, height, background, elements) => ({ preset, width, height, background, elements });
const grad = (color, color2, angle = 135) => ({ type: 'gradient', color, color2, angle });
const solid = (color) => ({ type: 'solid', color });
const cut = (s, n) => (s && s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s);

export const TEMPLATE_CATEGORIES = ['Sale & offers', 'Events', 'Launch & news', 'Tips & stories', 'Thumbnails & covers'];

export function buildTemplates(input = {}) {
  const brand = input.brand || 'Your Brand';
  const headline = cut(input.headline, 70);
  const body = cut(input.body, 160);
  const cta = cut(input.cta, 28);
  const tag = input.hashtags || '';
  // Auto-fit: long AI text shrinks so it doesn't crowd the rest of the design.
  const fit = (text, base, ideal) => (text && text.length > ideal ? Math.round(base * Math.max(0.5, Math.sqrt(ideal / text.length))) : base);
  const fh = (base, fallback) => fit(headline || fallback, base, 20);
  const fb = (base, fallback) => fit(body || fallback, base, 70);
  const fc = (base, fallback) => fit(cta || fallback, base, 14);
  const h = (fallback) => headline || fallback;
  const b = (fallback) => body || fallback;
  const c = (fallback) => cta || fallback;

  return [
    // ---------------- Sale & offers ----------------
    { name: 'Bold sale', category: 'Sale & offers', doc: doc('instagram-post', 1080, 1080, grad('#ff3d81', '#ffd23f'), [
      C({ x: 640, y: -120, w: 560, h: 560, fill: '#ffffff', opacity: 0.18 }),
      T({ x: 80, y: 110, w: 920, text: brand.toUpperCase(), fontFamily: 'Bebas Neue', fontSize: 90, fontWeight: 400, color: '#1b0b3a' }),
      T({ x: 80, y: 280, w: 920, text: h('Weekend\nSpecial'), fontSize: fh(130, 'Weekend\nSpecial'), color: '#ffffff', lineHeight: 1 }),
      R({ x: 80, y: 790, w: 560, h: 130, fill: '#1b0b3a', radius: 65 }),
      T({ x: 80, y: 822, w: 560, text: c('Shop now'), fontSize: fc(52, 'Shop now'), fontWeight: 700, color: '#ffd23f', align: 'center' }),
    ]) },
    { name: 'Price tag', category: 'Sale & offers', doc: doc('instagram-post', 1080, 1080, solid('#111827'), [
      R({ x: 60, y: 60, w: 960, h: 960, fill: '#ffd23f', radius: 40 }),
      T({ x: 130, y: 140, w: 820, text: brand, fontFamily: 'Pacifico', fontSize: 70, fontWeight: 400, color: '#111827' }),
      T({ x: 130, y: 300, w: 820, text: h('Limited-time offer'), fontSize: fh(110, 'Limited-time offer'), color: '#111827', lineHeight: 1 }),
      T({ x: 130, y: 620, w: 820, text: b('Only while supplies last.'), fontSize: fb(44, 'Only while supplies last.'), fontWeight: 500, color: '#1f2937', lineHeight: 1.3 }),
      T({ x: 130, y: 880, w: 820, text: c('Order today →'), fontSize: fc(56, 'Order today →'), fontWeight: 800, color: '#ff3d81' }),
    ]) },
    { name: 'Giveaway', category: 'Sale & offers', doc: doc('instagram-post', 1080, 1080, grad('#6b5bff', '#3dd6ff', 160), [
      T({ x: 80, y: 90, w: 920, text: 'GIVEAWAY', fontFamily: 'Bebas Neue', fontSize: 180, fontWeight: 400, color: '#ffffff', align: 'center' }),
      T({ x: 80, y: 320, w: 920, text: h(`Win a prize from ${brand}`), fontSize: fh(76, `Win a prize from ${brand}`), color: '#ffffff', align: 'center' }),
      R({ x: 140, y: 560, w: 800, h: 300, fill: '#ffffff', radius: 30, opacity: 0.92 }),
      T({ x: 180, y: 600, w: 720, text: b('1. Follow us\n2. Like this post\n3. Tag a friend'), fontSize: fb(46, '1. Follow us\n2. Like this post\n3. Tag a friend'), fontWeight: 700, color: '#1b0b3a', lineHeight: 1.4 }),
      T({ x: 80, y: 930, w: 920, text: 'No purchase necessary. Rules in caption.', fontSize: 30, fontWeight: 500, color: '#ffffff', align: 'center' }),
    ]) },
    { name: 'Discount story', category: 'Sale & offers', doc: doc('story', 1080, 1920, grad('#ff8a3d', '#ff3d81', 180), [
      T({ x: 90, y: 300, w: 900, text: brand.toUpperCase(), fontFamily: 'Bebas Neue', fontSize: 110, fontWeight: 400, color: '#fff7ed' }),
      T({ x: 90, y: 480, w: 900, text: h('Something special\nfor you'), fontSize: fh(130, 'Something special\nfor you'), color: '#ffffff', lineHeight: 1 }),
      T({ x: 90, y: 950, w: 900, text: b('Show this story in store or use the link.'), fontSize: fb(54, 'Show this story in store or use the link.'), fontWeight: 500, color: '#fff7ed', lineHeight: 1.3 }),
      R({ x: 90, y: 1500, w: 900, h: 170, fill: '#1b0b3a', radius: 85 }),
      T({ x: 90, y: 1548, w: 900, text: c('Tap the link ↑'), fontSize: fc(64, 'Tap the link ↑'), fontWeight: 800, color: '#ffd23f', align: 'center' }),
    ]) },

    // ---------------- Events ----------------
    { name: 'Event flyer', category: 'Events', doc: doc('flyer', 1275, 1650, solid('#f5efe6'), [
      R({ x: 0, y: 0, w: 1275, h: 620, fill: '#0f766e' }),
      T({ x: 90, y: 140, w: 1100, text: 'YOU\'RE INVITED', fontFamily: 'Bebas Neue', fontSize: 110, fontWeight: 400, color: '#ffd23f' }),
      T({ x: 90, y: 270, w: 1100, text: h(`${brand} Pop-Up`), fontFamily: 'Playfair Display', fontSize: fh(120, `${brand} Pop-Up`), fontWeight: 700, color: '#ffffff', lineHeight: 1.05 }),
      T({ x: 90, y: 720, w: 1100, text: 'Saturday · 10am – 2pm\nCommunity Center, Main Hall', fontSize: 60, fontWeight: 600, color: '#111827', lineHeight: 1.35 }),
      T({ x: 90, y: 1000, w: 1100, text: b('Free samples · Live demo · Meet the maker'), fontSize: fb(48, 'Free samples · Live demo · Meet the maker'), fontWeight: 500, color: '#374151', lineHeight: 1.4 }),
      R({ x: 90, y: 1380, w: 1095, h: 150, fill: '#ff3d81', radius: 30 }),
      T({ x: 90, y: 1420, w: 1095, text: c('Bring a friend!'), fontSize: fc(64, 'Bring a friend!'), color: '#ffffff', align: 'center' }),
    ]) },
    { name: 'Workshop poster', category: 'Events', doc: doc('poster', 1200, 1800, solid('#1b0b3a'), [
      C({ x: 650, y: -200, w: 800, h: 800, fill: '#6b5bff', opacity: 0.5 }),
      C({ x: -250, y: 1200, w: 700, h: 700, fill: '#ff3d81', opacity: 0.45 }),
      T({ x: 100, y: 180, w: 1000, text: 'FREE WORKSHOP', fontFamily: 'Bebas Neue', fontSize: 120, fontWeight: 400, color: '#42e6a4' }),
      T({ x: 100, y: 340, w: 1000, text: h('Learn something new'), fontSize: fh(130, 'Learn something new'), color: '#ffffff', lineHeight: 1 }),
      T({ x: 100, y: 800, w: 1000, text: b(`Hosted by ${brand}. Bring your questions, leave with a plan.`), fontSize: fb(54, `Hosted by ${brand}. Bring your questions, leave with a plan.`), fontWeight: 500, color: '#e9e3ff', lineHeight: 1.35 }),
      T({ x: 100, y: 1500, w: 1000, text: c('Save your seat'), fontSize: fc(72, 'Save your seat'), color: '#ffd23f' }),
    ]) },
    { name: 'Grand opening', category: 'Events', doc: doc('instagram-post', 1080, 1080, solid('#fff7ed'), [
      R({ x: 0, y: 0, w: 1080, h: 140, fill: '#ff3d81' }),
      R({ x: 0, y: 940, w: 1080, h: 140, fill: '#ff3d81' }),
      T({ x: 80, y: 230, w: 920, text: 'GRAND OPENING', fontFamily: 'Bebas Neue', fontSize: 140, fontWeight: 400, color: '#1b0b3a', align: 'center' }),
      T({ x: 80, y: 420, w: 920, text: h(brand), fontFamily: 'Playfair Display', fontSize: fh(100, brand), fontWeight: 700, color: '#ff3d81', align: 'center' }),
      T({ x: 80, y: 640, w: 920, text: b('Join us for opening day treats and surprises.'), fontSize: fb(44, 'Join us for opening day treats and surprises.'), fontWeight: 500, color: '#374151', align: 'center', lineHeight: 1.35 }),
      T({ x: 80, y: 975, w: 920, text: c('See you there!'), fontSize: fc(52, 'See you there!'), color: '#ffffff', align: 'center' }),
    ]) },

    // ---------------- Launch & news ----------------
    { name: 'Product launch', category: 'Launch & news', doc: doc('instagram-post', 1080, 1080, grad('#1b0b3a', '#6b5bff', 200), [
      T({ x: 80, y: 110, w: 920, text: 'JUST LAUNCHED', fontFamily: 'Bebas Neue', fontSize: 100, fontWeight: 400, color: '#42e6a4' }),
      T({ x: 80, y: 250, w: 920, text: h(`Meet the newest from ${brand}`), fontSize: fh(100, `Meet the newest from ${brand}`), color: '#ffffff', lineHeight: 1.02 }),
      R({ x: 80, y: 640, w: 920, h: 4, fill: '#42e6a4' }),
      T({ x: 80, y: 690, w: 920, text: b('Made with care and ready for you.'), fontSize: fb(46, 'Made with care and ready for you.'), fontWeight: 500, color: '#d9d4ff', lineHeight: 1.3 }),
      T({ x: 80, y: 900, w: 920, text: c('Link in bio'), fontSize: fc(56, 'Link in bio'), color: '#ffd23f' }),
    ]) },
    { name: 'Coming soon', category: 'Launch & news', doc: doc('story', 1080, 1920, solid('#0f172a'), [
      C({ x: 140, y: 420, w: 800, h: 800, fill: '#3dd6ff', opacity: 0.18 }),
      C({ x: 290, y: 570, w: 500, h: 500, fill: '#9b6bff', opacity: 0.3 }),
      T({ x: 90, y: 700, w: 900, text: 'COMING SOON', fontFamily: 'Bebas Neue', fontSize: 170, fontWeight: 400, color: '#ffffff', align: 'center' }),
      T({ x: 90, y: 1300, w: 900, text: h(`Something new from ${brand}`), fontSize: fh(70, `Something new from ${brand}`), color: '#3dd6ff', align: 'center' }),
      T({ x: 90, y: 1620, w: 900, text: c('Turn on notifications 🔔'), fontSize: fc(50, 'Turn on notifications 🔔'), fontWeight: 600, color: '#cbd5e1', align: 'center' }),
    ]) },
    { name: 'Announcement wide', category: 'Launch & news', doc: doc('social-wide', 1200, 675, grad('#0f766e', '#42e6a4'), [
      T({ x: 70, y: 70, w: 700, text: brand.toUpperCase(), fontFamily: 'Bebas Neue', fontSize: 64, fontWeight: 400, color: '#ecfdf5' }),
      T({ x: 70, y: 170, w: 760, text: h('Big news!'), fontSize: fh(92, 'Big news!'), color: '#ffffff', lineHeight: 1.02 }),
      T({ x: 70, y: 450, w: 760, text: b('Here\'s what\'s new and why it matters to you.'), fontSize: fb(34, 'Here\'s what\'s new and why it matters to you.'), fontWeight: 500, color: '#ecfdf5', lineHeight: 1.3 }),
      C({ x: 860, y: 140, w: 400, h: 400, fill: '#ffffff', opacity: 0.2 }),
      T({ x: 860, y: 300, w: 300, text: c('Learn more'), fontSize: fc(46, 'Learn more'), color: '#ffffff', align: 'center' }),
    ]) },

    // ---------------- Tips & stories ----------------
    { name: 'Quick tip', category: 'Tips & stories', doc: doc('instagram-post', 1080, 1080, solid('#f5efe6'), [
      R({ x: 80, y: 80, w: 220, h: 90, fill: '#0f766e', radius: 45 }),
      T({ x: 80, y: 98, w: 220, text: 'TIP', fontFamily: 'Bebas Neue', fontSize: 64, fontWeight: 400, color: '#ffffff', align: 'center' }),
      T({ x: 80, y: 230, w: 920, text: h('One small trick that makes a big difference'), fontSize: fh(84, 'One small trick that makes a big difference'), color: '#111827', lineHeight: 1.05 }),
      T({ x: 80, y: 600, w: 920, text: b('Explain the tip in one or two short sentences.'), fontSize: fb(46, 'Explain the tip in one or two short sentences.'), fontWeight: 500, color: '#374151', lineHeight: 1.35 }),
      T({ x: 80, y: 940, w: 920, text: `${brand} · ${c('Save this post')}`, fontSize: 36, fontWeight: 700, color: '#0f766e' }),
    ]) },
    { name: 'Customer love', category: 'Tips & stories', doc: doc('instagram-post', 1080, 1080, grad('#ffd23f', '#ff8a3d'), [
      T({ x: 80, y: 80, w: 200, text: '“', fontFamily: 'Playfair Display', fontSize: 300, fontWeight: 700, color: '#1b0b3a', lineHeight: 1 }),
      T({ x: 80, y: 320, w: 920, text: b('[Paste a REAL customer quote, with their permission]'), fontFamily: 'Playfair Display', fontSize: fb(64, '[Paste a REAL customer quote, with their permission]'), fontWeight: 700, color: '#1b0b3a', lineHeight: 1.2 }),
      T({ x: 80, y: 820, w: 920, text: '— Customer first name', fontSize: 44, fontWeight: 600, color: '#1b0b3a' }),
      T({ x: 80, y: 940, w: 920, text: brand, fontFamily: 'Pacifico', fontSize: 48, fontWeight: 400, color: '#ffffff' }),
    ]) },
    { name: 'Behind the scenes', category: 'Tips & stories', doc: doc('story', 1080, 1920, solid('#111827'), [
      R({ x: 60, y: 60, w: 960, h: 1100, fill: '#374151', radius: 40 }),
      T({ x: 60, y: 560, w: 960, text: 'Add your photo here 📷', fontSize: 50, fontWeight: 600, color: '#9ca3af', align: 'center' }),
      T({ x: 90, y: 1240, w: 900, text: 'BEHIND THE SCENES', fontFamily: 'Bebas Neue', fontSize: 100, fontWeight: 400, color: '#ffd23f' }),
      T({ x: 90, y: 1360, w: 900, text: h(`How we make it at ${brand}`), fontSize: fh(78, `How we make it at ${brand}`), color: '#ffffff', lineHeight: 1.05 }),
      T({ x: 90, y: 1700, w: 900, text: c('Swipe for more'), fontSize: fc(46, 'Swipe for more'), fontWeight: 600, color: '#9ca3af' }),
    ]) },
    { name: 'Thank you', category: 'Tips & stories', doc: doc('instagram-post', 1080, 1080, grad('#9b6bff', '#ff3d81'), [
      T({ x: 80, y: 300, w: 920, text: 'Thank you!', fontFamily: 'Pacifico', fontSize: 150, fontWeight: 400, color: '#ffffff', align: 'center' }),
      T({ x: 80, y: 560, w: 920, text: b(`To everyone who supports ${brand}: you make this possible.`), fontSize: fb(50, `To everyone who supports ${brand}: you make this possible.`), fontWeight: 600, color: '#fff7ed', align: 'center', lineHeight: 1.3 }),
      T({ x: 80, y: 900, w: 920, text: tag || '#ThankYou', fontSize: 40, fontWeight: 700, color: '#fff7ed', align: 'center' }),
    ]) },

    // ---------------- Thumbnails & covers ----------------
    { name: 'Clean thumbnail', category: 'Thumbnails & covers', doc: doc('thumbnail', 1280, 720, solid('#111827'), [
      R({ x: 700, y: 0, w: 580, h: 720, fill: '#ffd23f' }),
      T({ x: 70, y: 170, w: 600, text: h('How we got our first 100 customers'), fontSize: fh(80, 'How we got our first 100 customers'), color: '#ffffff', lineHeight: 1.05 }),
      T({ x: 760, y: 300, w: 460, text: brand, fontFamily: 'Pacifico', fontSize: 76, fontWeight: 400, color: '#111827', align: 'center' }),
    ]) },
    { name: 'Bold thumbnail', category: 'Thumbnails & covers', doc: doc('thumbnail', 1280, 720, grad('#ff3d81', '#6b5bff', 120), [
      T({ x: 60, y: 90, w: 1160, text: h('YOU NEED TO SEE THIS'), fontFamily: 'Bebas Neue', fontSize: fh(170, 'YOU NEED TO SEE THIS'), fontWeight: 400, color: '#ffffff', lineHeight: 0.95 }),
      R({ x: 60, y: 560, w: 520, h: 100, fill: '#ffd23f', radius: 20 }),
      T({ x: 60, y: 578, w: 520, text: brand, fontSize: 52, color: '#1b0b3a', align: 'center' }),
    ]) },
    { name: 'Menu / price list', category: 'Thumbnails & covers', doc: doc('flyer', 1275, 1650, solid('#fff7ed'), [
      T({ x: 90, y: 110, w: 1100, text: brand, fontFamily: 'Playfair Display', fontSize: 110, fontWeight: 700, color: '#1b0b3a', align: 'center' }),
      T({ x: 90, y: 280, w: 1100, text: h('Menu & Prices'), fontFamily: 'Bebas Neue', fontSize: fh(90, 'Menu & Prices'), fontWeight: 400, color: '#ff3d81', align: 'center' }),
      R({ x: 190, y: 420, w: 895, h: 4, fill: '#1b0b3a' }),
      T({ x: 190, y: 480, w: 895, text: b('Item one ........ $0\nItem two ........ $0\nItem three ...... $0\nItem four ....... $0'), fontSize: fb(56, 'Item one ........ $0\nItem two ........ $0\nItem three ...... $0\nItem four ....... $0'), fontWeight: 600, color: '#1f2937', lineHeight: 1.8 }),
      T({ x: 90, y: 1460, w: 1100, text: c('Ask about today\'s special!'), fontSize: fc(54, 'Ask about today\'s special!'), fontWeight: 700, color: '#0f766e', align: 'center' }),
    ]) },
  ];
}

/** Turn an AI tool result into template text. Returns [{label, fields}] choices. */
export function designChoicesFromRun(run, brand) {
  const o = run.output ?? {};
  const base = { brand, hashtags: '' };
  if (run.toolId === 'social-post') return (o.options ?? []).map((x, i) => ({ label: `Option ${i + 1}: ${x.style}`, fields: { ...base, headline: x.hook, body: x.caption, cta: x.callToAction, hashtags: (x.hashtags ?? []).map((t) => (t.startsWith('#') ? t : `#${t}`)).join(' ') } }));
  if (run.toolId === 'ad-copy') return (o.variants ?? []).map((x, i) => ({ label: `Variant ${i + 1}: ${x.headline}`, fields: { ...base, headline: x.headline, body: x.body, cta: x.callToAction } }));
  if (run.toolId === 'persona') return (o.personas ?? []).map((x) => ({ label: `For ${x.name}`, fields: { ...base, headline: x.messageThatWorks, body: x.snapshot } }));
  if (run.toolId === 'content-calendar') return (o.plan ?? []).slice(0, 10).map((x) => ({ label: `${x.day}: ${x.contentType}`, fields: { ...base, headline: x.idea, cta: x.callToAction } }));
  if (run.toolId === 'video-script') return [{ label: o.title || 'Video script', fields: { ...base, headline: o.hook, cta: o.callToAction } }];
  if (run.toolId === 'compliance-check' && o.improvedVersion) return [{ label: 'Improved version', fields: { ...base, body: o.improvedVersion } }];
  return [];
}

/** Turn a Video Script result into Video Maker scenes. */
export function scenesFromScript(run) {
  const o = run.output ?? {};
  const styles = ['aurora', 'particles', 'sunset', 'bokeh', 'stripes', 'waves', 'confetti'];
  const secs = (time) => {
    const m = /(\d+):(\d+)\s*[-–]\s*(\d+):(\d+)/.exec(time ?? '');
    return m ? Math.min(10, Math.max(1, (+m[3] * 60 + +m[4]) - (+m[1] * 60 + +m[2]))) : 3;
  };
  return (o.scenes ?? []).slice(0, 12).map((s, i) => ({
    id: uid(),
    duration: secs(s.time),
    bg: { kind: 'animated', style: styles[i % styles.length] },
    text: cut(s.onScreenText || s.voiceover, 80) || '',
    subtext: i === (o.scenes.length - 1) ? cut(o.callToAction, 60) || '' : '',
    color: '#ffffff',
    position: 'center',
    font: 'Outfit',
  }));
}
