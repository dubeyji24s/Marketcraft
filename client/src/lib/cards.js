// Turns any lesson into a deck of short, visual "swipe cards" (one idea per card),
// so learners can flick through a lesson like a feed instead of reading a long page.
// Kids get shorter cards; grown-ups get a slightly denser "quick mode".

const EMOJI_RULES = [
  [/price|pric|profit|money|cost|budget|break-even|discount/i, '💰'],
  [/photo|picture|image|camera|light/i, '📸'],
  [/video|film|reel|youtube|tiktok/i, '🎬'],
  [/story|hero|origin/i, '📖'],
  [/review|rating|star|feedback/i, '⭐'],
  [/email|inbox|newsletter/i, '📧'],
  [/social|post|instagram|hashtag|content/i, '📱'],
  [/customer|audience|who|people|fan/i, '🎯'],
  [/brand|logo|colou?r|font|voice/i, '🎨'],
  [/rule|law|ftc|honest|truth|legal|disclos|privacy|claim/i, '⚖️'],
  [/search|seo|google|found/i, '🔎'],
  [/event|market|fair|stall|sign/i, '🎪'],
  [/test|measure|track|number|data|result/i, '📊'],
  [/scam|password|hack|secur|safe|protect/i, '🛡️'],
  [/plan|calendar|week|month|launch/i, '🗓️'],
  [/partner|team|friend|together/i, '🤝'],
  [/word|write|headline|copy|read/i, '✍️'],
  [/green|eco|planet|recycl/i, '🌱'],
  [/ship|deliver|order|refund|online/i, '📦'],
];
export function emojiFor(text = '') {
  return EMOJI_RULES.find(([re]) => re.test(text))?.[1] ?? '💡';
}

const GRADIENTS = [
  ['#7c5cff', '#2bd2ff'],
  ['#ff5f8f', '#ffb347'],
  ['#00c9a7', '#3d7bff'],
  ['#ff7a59', '#ff3d77'],
  ['#3dd6ff', '#8b5cf6'],
  ['#f59e0b', '#ef4444'],
  ['#10b981', '#06b6d4'],
];
export const cardGradient = (i) => GRADIENTS[i % GRADIENTS.length];

/** Strip simple markdown so text reads well on a card and in text-to-speech. */
export function plain(text = '') {
  return text.replace(/\*\*(.+?)\*\*/g, '$1').replace(/\*(.+?)\*/g, '$1').replace(/`/g, '').replace(/\[(.+?)\]\(.+?\)/g, '$1').trim();
}

function sentences(text) {
  return plain(text).replace(/\s+/g, ' ').match(/[^.!?]+[.!?]+["')\]]?|[^.!?]+$/g)?.map((s) => s.trim()).filter(Boolean) ?? [];
}

/** Splits a section body into short chunks: bullet lists become their own cards. */
function chunk(body, maxChars) {
  const out = [];
  for (const block of body.split(/\n\s*\n/)) {
    const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
    const bullets = lines.filter((l) => /^(-|\d+\.)\s/.test(l));
    if (bullets.length >= 2) {
      const intro = lines.filter((l) => !/^(-|\d+\.)\s/.test(l)).join(' ');
      if (intro) out.push(...packSentences(sentences(intro), maxChars).map((t) => ({ kind: 'text', text: t })));
      for (let i = 0; i < bullets.length; i += 4) {
        out.push({ kind: 'list', items: bullets.slice(i, i + 4).map((b) => plain(b.replace(/^(-|\d+\.)\s/, ''))) });
      }
    } else {
      out.push(...packSentences(sentences(lines.join(' ')), maxChars).map((t) => ({ kind: 'text', text: t })));
    }
  }
  return out;
}
function packSentences(list, maxChars) {
  const out = [];
  let cur = '';
  for (const s of list) {
    if (cur && (cur + ' ' + s).length > maxChars) { out.push(cur); cur = s; } else cur = cur ? `${cur} ${s}` : s;
  }
  if (cur) out.push(cur);
  return out;
}

/**
 * @param lesson full lesson (with sections, keyTakeaways, actionSteps, quiz without answers)
 * @param {{kid:boolean}} opts
 */
export function buildDeck(lesson, { kid = false } = {}) {
  const maxChars = kid ? 170 : 260;
  const cards = [];
  cards.push({ type: 'cover', emoji: emojiFor(lesson.title), title: lesson.title, text: plain(lesson.summary), minutes: Math.max(2, Math.round((lesson.estimatedMinutes ?? 6) * (kid ? 0.5 : 0.4))) });
  lesson.sections.forEach((s, si) => {
    const parts = chunk(s.body, maxChars);
    // kids see the first 2 cards of each section; the rest is one tap away
    const shown = kid ? parts.slice(0, 2) : parts.slice(0, 4);
    const more = kid ? parts.slice(2) : parts.slice(4);
    // the heading decides the picture first; the card text only if the heading has no match
    const headEmoji = emojiFor(s.heading);
    shown.forEach((p, pi) => cards.push({ type: 'idea', section: si, heading: s.heading, emoji: headEmoji !== '💡' ? headEmoji : emojiFor(p.text ?? p.items?.join(' ')), part: pi + 1, of: shown.length, ...p, more: pi === shown.length - 1 ? more : [] }));
  });
  // quick check: lesson quiz questions, one per card (answers are checked by the server at the end)
  (lesson.quiz ?? []).forEach((q, qi) => cards.push({ type: 'quiz', index: qi, question: q.question, options: q.options }));
  const takeaways = (lesson.keyTakeaways ?? []).slice(0, kid ? 4 : 6);
  if (takeaways.length) cards.push({ type: 'recap', items: takeaways });
  const steps = (lesson.actionSteps ?? []).slice(0, 3);
  if (steps.length) cards.push({ type: 'try', items: steps });
  cards.push({ type: 'finish' });
  return cards;
}

/** What text-to-speech reads for a card. */
export function speakText(card) {
  switch (card.type) {
    case 'cover': return `${card.title}. ${card.text}`;
    case 'idea': return `${card.heading}. ${card.text ?? card.items.join('. ')}`;
    case 'quiz': return `${card.question} ${card.options.map((o, i) => `Option ${i + 1}: ${o}.`).join(' ')}`;
    case 'recap': return `Remember: ${card.items.join('. ')}`;
    case 'try': return `Try it: ${card.items.join('. ')}`;
    default: return 'Great job! You finished the lesson.';
  }
}
