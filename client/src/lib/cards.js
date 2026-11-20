// Turns any lesson into a deck of short, visual "swipe cards" (one idea per card),
// so learners can flick through a lesson like a feed instead of reading a long page.
// Kids get shorter cards; grown-ups get a slightly denser "quick mode".

import { topicIcon } from '../components/Icon.jsx';
import { LESSON_TOOLS } from '../components/LiveTools.jsx';

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
  cards.push({ type: 'cover', icon: topicIcon(lesson.title, lesson.summary), title: lesson.title, text: plain(lesson.summary), minutes: Math.max(2, Math.round((lesson.estimatedMinutes ?? 6) * (kid ? 0.5 : 0.4))) });
  lesson.sections.forEach((s, si) => {
    const parts = chunk(s.body, maxChars);
    // kids see the first 2 cards of each section; the rest is one tap away
    const shown = kid ? parts.slice(0, 2) : parts.slice(0, 4);
    const more = kid ? parts.slice(2) : parts.slice(4);
    // the heading decides the icon first; the card text only if the heading has no match
    shown.forEach((p, pi) => cards.push({ type: 'idea', section: si, heading: s.heading, icon: topicIcon(s.heading, p.text ?? p.items?.join(' ')), part: pi + 1, of: shown.length, ...p, more: pi === shown.length - 1 ? more : [] }));
  });
  // learn by doing: a real decision, then a hands-on tool for some topics
  if (lesson.scenario) cards.push({ type: 'scenario', ...lesson.scenario });
  if (LESSON_TOOLS[lesson.slug]) cards.push({ type: 'tool', tool: LESSON_TOOLS[lesson.slug] });
  // quick check: one quiz question per card, with instant feedback
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
    case 'scenario': return `What would you do? ${card.setup} ${card.options.map((o, i) => `Option ${i + 1}: ${o.text}.`).join(' ')}`;
    case 'tool': return 'Try it yourself: move the sliders or type to see what happens.';
    case 'quiz': return `${card.question} ${card.options.map((o, i) => `Option ${i + 1}: ${o}.`).join(' ')}`;
    case 'recap': return `Remember: ${card.items.join('. ')}`;
    case 'try': return `Try it: ${card.items.join('. ')}`;
    default: return 'Great job! You finished the lesson.';
  }
}
