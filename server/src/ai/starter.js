// Starter engine: free, offline versions of the six marketing tools.
// No API key and no cost. It writes from the brand's own facts using proven copy
// formulas (hook → value → proof → call to action) and returns the same shapes as the
// AI tools, so every screen works the same. Pure JS: used by the server and the preview.

const lines = (s) => String(s || '').split(/\n|;|•/).map((x) => x.trim().replace(/^[-*]\s*/, '')).filter(Boolean);
const first = (s, fallback = '') => lines(s)[0] || fallback;
const cap = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s);
const strip = (s) => String(s || '').replace(/[.!?]+$/, '').trim();
const pick = (arr, i) => arr[((i % arr.length) + arr.length) % arr.length];
const words = (s) => String(s || '').toLowerCase().match(/[a-z']+/g) || [];
const hashOf = (s) => [...String(s)].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
// end a sentence exactly once ("Co." + "." stays "Co.")
const sent = (s) => { const t = String(s || '').trim(); return /[.!?]$/.test(t) ? t : `${t}.`; };
// "gift shoppers and people who love handmade goods" -> "gift shoppers"
// add a/an unless plural: "wool scarf" -> "a wool scarf"
const art = (s) => { const t = String(s || '').trim(); return /s$/i.test(t) || !t ? t : `${/^[aeiou]/i.test(t) ? 'an' : 'a'} ${t}`; };
const shortAud = (s) => String(s || '').split(/,| and | who | that /i)[0].trim() || 'people';
const tagify = (s) => '#' + String(s).replace(/[^a-z0-9 ]/gi, ' ').split(' ').filter(Boolean).map(cap).join('').slice(0, 28);

function facts(brief, mode, referralLink) {
  const name = brief.name || brief.displayName || 'our brand';
  const products = lines(brief.products);
  const product = (products[0] || '').replace(/\s*[-–:]?\s*\$\s?\d+(\.\d+)?/, '').trim() || name;
  const benefit = strip(first(brief.keyMessages, brief.tagline || first(brief.description, 'made with care')));
  const benefits = lines(brief.keyMessages).length ? lines(brief.keyMessages).map(strip) : [benefit];
  const audience = strip(first(brief.audience, 'people who care about quality'));
  const offer = strip(first(brief.offers, ''));
  const brandTags = (brief.hashtags || '').match(/#\w+/g) || [];
  const disclosure = mode === 'own' ? '' : `#ad · I'm a brand ambassador for ${name}`;
  const link = referralLink || '[your link]';
  return { mode, name, products, product, benefit, benefits, audience, aud: shortAud(audience), offer, brandTags, disclosure, link, description: strip(first(brief.description, '')) };
}

const withDisclosure = (text, f) => (f.disclosure ? `${f.disclosure}\n\n${text}` : text);

// ---- tools -------------------------------------------------------------------------
function persona(inp, f) {
  const area = inp.area || 'your local community and online groups';
  const base = [
    { name: 'Busy Brianna', snapshot: `Late 20s to 40s, juggling work and family; values things that save time and feel thoughtful.`, pains: ['Not enough time to shop around', 'Tired of products that don\'t last'], wants: [`Something reliable like ${f.product}`, 'Quick, easy ordering'], where: [`Local parent and community groups around ${area}`, 'Instagram and Facebook in the evening', 'Weekend markets'], objections: ['Is it worth the price?', 'Will it arrive on time?'] },
    { name: 'Gift-hunting Gabe', snapshot: 'Any age, shopping for someone else; wants a gift that feels personal.', pains: ['Gifts that feel generic', 'Last-minute stress'], wants: ['Something unique with a story', 'Nice presentation'], where: ['Holiday and birthday seasons', 'Pinterest and Instagram gift ideas', 'Word of mouth from friends'], objections: ['Will they like it?', 'Can I return or exchange it?'] },
    { name: 'Local-first Lena', snapshot: 'Supports small and local businesses; shares finds with friends.', pains: ['Big brands feel impersonal', 'Hard to discover small makers'], wants: ['To know the people behind the brand', 'To feel part of something'], where: [`Neighbourhood pages and events in ${area}`, 'Local newsletters', 'Community boards'], objections: ['Is it really made locally/with care?'] },
  ];
  const aud = f.audience.toLowerCase();
  const ordered = aud.includes('gift') ? [base[1], base[0], base[2]] : aud.includes('local') ? [base[2], base[0], base[1]] : base;
  return {
    personas: ordered.map((p) => ({
      name: p.name,
      snapshot: p.snapshot,
      painPoints: p.pains,
      whatTheyWant: p.wants,
      whereToReachThem: p.where,
      messageThatWorks: `${cap(f.benefit)}: ${f.name} makes it easy.`,
      likelyObjections: p.objections,
    })),
    startWith: `Start with ${ordered[0].name}: they match "${f.audience}" best and you can reach them for free in ${area}.`,
  };
}

const HOOKS = [
  (f, t) => `Here's why people keep coming back to ${f.name}`,
  (f, t) => `${cap(t || f.product)}: the honest story`,
  (f, t) => `Stop scrolling if you love ${f.product.toLowerCase()}`,
  (f, t) => `3 reasons ${f.aud.toLowerCase()} choose ${f.name}`,
  (f, t) => `What makes ${f.name} different? ${cap(f.benefit)}.`,
];
const CTAS = {
  'Get people to visit the website': (f) => `Visit ${f.link}`,
  'Get sign-ups': (f) => `Sign up at ${f.link}`,
  'Build awareness': () => 'Follow for more',
  'Promote an offer': (f) => (f.offer ? `${cap(f.offer)}: ${f.link}` : `See what's new: ${f.link}`),
  'Answer a common question': () => 'Got a question? Ask in the comments',
};
const LIMITS = { 'X (Twitter)': 260, 'WhatsApp / text message': 300, LinkedIn: 1200, Pinterest: 450 };

function socialPost(inp, f, seed) {
  const cta = (CTAS[inp.goal] || CTAS['Build awareness'])(f);
  const topic = strip(inp.topic);
  const tone = inp.tone || 'Friendly & fun';
  const emoji = tone === 'Professional' ? '' : tone === 'Funny' ? ' 😄' : ' ✨';
  const own = f.mode === 'own';
  const story = own
    ? `We started ${f.name} to make ${art(f.product.toLowerCase())} we'd be proud to give. ${sent(cap(f.description || f.benefit))}`
    : `When I first tried ${f.name}, one thing stood out: ${sent(f.benefit.toLowerCase())} ${f.description ? sent(cap(f.description)) : ''}`;
  const styles = [
    ['Personal story', `${sent(cap(topic))}${emoji}\n\n${story.trim()}\n\n${cta}`],
    ['Quick value', `${cap(strip(topic))}${emoji}\n\n✔ ${f.benefits.slice(0, 3).map(cap).join('\n✔ ')}\n\nMade for ${f.aud.toLowerCase()} who want something better.\n\n${cta}`],
    ['Question + answer', `What makes ${art(f.product.toLowerCase())} from ${f.name} worth it?\n\nShort answer: ${sent(f.benefits.slice(0, 2).join(', and ').toLowerCase())} ${own ? 'That\'s our promise.' : 'That\'s why I recommend it.'}${emoji}\n\n${cta}`],
  ];
  const limit = LIMITS[inp.platform] || 2000;
  const tags = [...new Set([...f.brandTags, tagify(f.name), tagify(f.product)])].slice(0, inp.platform === 'LinkedIn' ? 3 : 6);
  return {
    options: styles.map(([style, body], i) => {
      const caption = withDisclosure(body, f);
      return {
        style,
        hook: pick(HOOKS, seed + i)(f, topic),
        caption: caption.length > limit ? caption.slice(0, limit - 1) + '…' : caption,
        hashtags: tags,
        callToAction: cta,
        visualIdea: pick([`Close-up of ${f.product.toLowerCase()} in natural window light`, `A real customer moment with ${f.product.toLowerCase()} (with their permission)`, `Behind the scenes: how ${f.product.toLowerCase()} is made or packed`], seed + i),
      };
    }),
    disclosureLine: f.disclosure || 'Not needed: this is your own brand. Disclose any paid partners.',
    bestTimeToPost: inp.platform === 'LinkedIn' ? 'Tuesday–Thursday mornings' : 'Weekday evenings (6–9pm) and weekend mornings',
  };
}

function videoScript(inp, f) {
  const total = parseInt(inp.length, 10) || 30;
  const idea = strip(inp.idea);
  const beats = [
    ['Hook', cap(idea), `Ever wondered ${/^(how|why|what|where|when)\b/i.test(idea) ? idea.toLowerCase() : `about ${idea.toLowerCase()}`}? Watch this.`, 'Bold text over the first shot'],
    ['Problem', `Made for ${f.aud.toLowerCase()}`, `If you're one of the ${f.aud.toLowerCase()}, this is for you.`, 'Relatable moment'],
    ['Solution', f.name, f.mode === 'own' ? `This is ${f.name}. ${sent(cap(f.benefit))}` : `That's why I use ${sent(f.name)} ${sent(cap(f.benefit))}`, `Show ${f.product.toLowerCase()} in action`],
    ['Proof', cap(f.benefits[1] || f.benefit), `${sent(cap(f.benefits[1] || f.benefit))} See it for yourself.`, 'Close-up detail'],
    ['Call to action', 'Link in bio', `Want one? ${f.link === '[your link]' ? 'Link in bio.' : 'Check the link.'}`, 'Logo + call to action'],
  ];
  const n = total <= 15 ? 3 : total <= 30 ? 4 : 5;
  const chosen = n === 3 ? [beats[0], beats[2], beats[4]] : n === 4 ? [beats[0], beats[2], beats[3], beats[4]] : beats;
  const step = Math.round(total / chosen.length);
  const ts = (s) => `0:${String(Math.min(59, s)).padStart(2, '0')}`;
  return {
    title: `${f.name}: ${cap(idea)}`,
    hook: `Open on motion: ${chosen[0][3].toLowerCase()}, with the words "${chosen[0][1]}" on screen in the first 3 seconds.`,
    scenes: chosen.map((b, i) => ({ time: `${ts(i * step)}-${ts(Math.min(total, (i + 1) * step))}`, visual: b[3], voiceover: b[2], onScreenText: b[1] })),
    callToAction: f.link === '[your link]' ? 'Link in bio' : `Visit ${f.link}`,
    shotList: chosen.map((b) => b[3]),
    filmingTips: ['Film vertically for Reels/TikTok/Shorts', 'Face a window for free, soft light', 'Keep each shot under 4 seconds', 'Add captions: most people watch muted', ...(f.disclosure ? ['Say AND show your ambassador disclosure in the video'] : [])],
    disclosureLine: f.disclosure || 'Not needed: this is your own brand.',
  };
}

function adCopy(inp, f) {
  const offer = strip(inp.offer) || f.offer;
  const aud = strip(inp.audience) || f.audience;
  const flyer = /flyer|poster/i.test(inp.format || '');
  return {
    variants: [
      { headline: offer ? cap(offer) : `${cap(f.benefit)}`, body: `${sent(f.name)} Made for ${sent(shortAud(aud).toLowerCase())} ${f.description ? sent(cap(f.description)) : ''}`.trim(), callToAction: flyer ? 'Scan the QR code' : 'Learn more', whyItWorks: 'Leads with the strongest reason to care, then says who it\'s for.' },
      { headline: `${cap(shortAud(aud))}, this one's for you`, body: `Meet ${f.name}: ${f.benefits.slice(0, 2).join(' · ').toLowerCase()}.`, callToAction: flyer ? 'Visit us today' : 'Shop now', whyItWorks: 'Calls out the audience by name so the right people stop and read.' },
      { headline: `Why choose ${f.name}?`, body: `${sent(f.benefits.slice(0, 2).map(cap).join('. '))} Simple as that.`, callToAction: flyer ? 'Find us online' : 'See for yourself', whyItWorks: 'A curiosity question with a short, confident answer.' },
    ],
    designTips: flyer
      ? ['One big headline you can read from 3 metres away', 'One photo, not five', 'Put a QR code to your link in a corner', 'High contrast colours (dark on light or light on dark)']
      : ['Show the product in the first frame', 'Keep text under 20% of the image', 'One clear button', 'Test two headlines and keep the winner'],
    disclosureLine: f.disclosure || 'Not needed: this is your own brand.',
  };
}

function contentCalendar(inp, f) {
  const weeks = parseInt(inp.weeks, 10) || 1;
  const per = /4\+/.test(inp.time || '') ? 4 : /2-3/.test(inp.time || '') ? 3 : 2;
  const platforms = lines(String(inp.platforms || 'Instagram').replace(/ and /gi, ',').replace(/,/g, '\n'));
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const slots = per === 2 ? [1, 4] : per === 3 ? [0, 2, 4] : [0, 2, 4, 5];
  const types = [
    ['Show', `${cap(f.product)} in action`],
    ['Teach', `A quick tip for ${f.audience.toLowerCase()}`],
    ['Tell', `Behind the scenes at ${f.name}`],
    ['Ask', 'A poll or question for your followers'],
    ['Proof', 'Share a real customer comment (with permission)'],
  ];
  const plan = [];
  let k = 0;
  for (let w = 1; w <= weeks; w++) {
    for (const d of slots) {
      const [type, idea] = pick(types, k);
      plan.push({ day: `Week ${w} · ${days[d]}`, platform: pick(platforms, k), contentType: type, idea: `${idea}${inp.focus ? ` (${strip(inp.focus)})` : ''}`, callToAction: pick(['Follow for more', 'Comment below', `Visit ${f.link}`, 'Share with a friend', 'Save this post'], k) });
      k++;
    }
  }
  return {
    weeklyGoal: `Post ${per} times a week and reply to every comment within a day${inp.focus ? `, focused on ${strip(inp.focus).toLowerCase()}` : ''}.`,
    plan,
    howToMeasure: ['Which post got the most saves and shares?', 'How many link clicks did you get (use your tracked link)?', 'How many new followers or sign-ups this week?', 'Repeat the post type that did best next week'],
  };
}

const HYPE = ['best', 'guaranteed', 'guarantee', '#1', 'number one', 'cure', 'cures', 'miracle', 'risk-free', 'risk free', 'instant results', '100%', 'never fails', 'get rich', 'free money'];
const URGENT = ['last chance', 'only today', 'hurry', 'act now', 'before it\'s gone'];

function complianceCheck(inp, f) {
  const draft = String(inp.draft || '');
  const low = draft.toLowerCase();
  const issues = [];
  const hasDisclosure = /#ad\b|#sponsored|sponsored|ambassador|paid partnership|#partner/i.test(draft);
  if (f.disclosure && !hasDisclosure) issues.push({ severity: 'must fix', problem: 'No ambassador disclosure.', fix: `Add "${f.disclosure}" at the start, where people see it before "more".` });
  for (const w of HYPE) if (low.includes(w)) issues.push({ severity: 'must fix', problem: `"${w}" is a big claim you may not be able to prove.`, fix: 'Replace it with a specific, honest fact from the brand brief.' });
  for (const w of URGENT) if (low.includes(w)) issues.push({ severity: 'nice to have', problem: `"${w}" can feel like fake urgency.`, fix: 'Only use deadlines that are real.' });
  if (/\$\s?\d/.test(draft) && !/\$\s?\d/.test(JSON.stringify(f.products))) issues.push({ severity: 'must fix', problem: 'A price is mentioned that isn\'t in the brand brief.', fix: 'Remove it or ask the business to confirm the price.' });
  if (draft.length > 2200) issues.push({ severity: 'nice to have', problem: 'Very long for social media.', fix: 'Cut to the hook, one benefit and one call to action.' });
  if (!/http|link|visit|shop|follow|comment|sign up|order|dm|message/i.test(draft)) issues.push({ severity: 'nice to have', problem: 'No clear call to action.', fix: 'End with one action, like "Visit the link in bio".' });
  if ((draft.match(/#\w+/g) || []).length > 12) issues.push({ severity: 'nice to have', problem: 'Lots of hashtags can look spammy.', fix: 'Keep 3–6 relevant hashtags.' });
  if (/\b(school|street|my address|phone number)\b/i.test(draft)) issues.push({ severity: 'must fix', problem: 'Possible personal information.', fix: 'Remove addresses, school names and phone numbers.' });
  const must = issues.filter((i) => i.severity === 'must fix').length;
  const score = Math.max(10, 100 - must * 25 - (issues.length - must) * 8);
  let improved = draft;
  for (const w of HYPE) improved = improved.replace(new RegExp(w.replace(/[#+]/g, '\\$&'), 'gi'), '');
  improved = improved.replace(/\s{2,}/g, ' ').trim();
  if (f.disclosure && !hasDisclosure) improved = `${f.disclosure}\n\n${improved}`;
  return {
    readinessScore: score,
    verdict: must ? 'Do not post yet' : issues.length ? 'Needs small changes' : 'Ready to post',
    disclosurePresent: hasDisclosure,
    issues,
    strengths: [words(draft).length < 120 ? 'Nice and short' : 'Detailed', ...(hasDisclosure ? ['Clear disclosure'] : [])],
    improvedVersion: improved,
  };
}

const RUNNERS = { persona, 'social-post': socialPost, 'video-script': videoScript, 'ad-copy': adCopy, 'content-calendar': contentCalendar, 'compliance-check': complianceCheck };

/** Run a tool with the free Starter engine. mode: 'ambassador' | 'own'. */
export function runStarter(toolId, inputs, brief, { mode = 'ambassador', referralLink = '' } = {}) {
  const run = RUNNERS[toolId];
  if (!run) throw new Error('Unknown tool');
  const f = facts(brief || {}, mode, referralLink);
  return run(inputs || {}, f, hashOf(JSON.stringify(inputs || {})));
}
