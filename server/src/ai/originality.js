// Anti-plagiarism guardrail: deterministic n-gram overlap between generated lesson
// text and the source excerpts the research step actually read. This is a check on
// top of the prompt instructions, not a replacement for them.

const STOP = new Set('a an the and or of to in on for with is are be by as at it this that from your you'.split(' '));

export function tokenize(text = '') {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s']/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

function ngrams(tokens, n) {
  const out = new Set();
  for (let i = 0; i + n <= tokens.length; i++) {
    const gram = tokens.slice(i, i + n);
    // ignore n-grams made almost entirely of stop words (common phrasing, not copying)
    if (gram.filter((t) => !STOP.has(t)).length < Math.ceil(n / 2)) continue;
    out.add(gram.join(' '));
  }
  return out;
}

/**
 * @returns {{ score: number, overlapRatio: number, flagged: string[], passed: boolean }}
 *   score: 0-100 originality (100 = no shared 8-word runs with sources)
 */
export function checkOriginality(generated, sourceTexts, { n = 8, maxOverlap = 0.03 } = {}) {
  const genGrams = ngrams(tokenize(generated), n);
  if (genGrams.size === 0) return { score: 100, overlapRatio: 0, flagged: [], passed: true };

  const srcGrams = new Set();
  for (const s of sourceTexts) for (const g of ngrams(tokenize(s), n)) srcGrams.add(g);

  const flagged = [...genGrams].filter((g) => srcGrams.has(g));
  const overlapRatio = flagged.length / genGrams.size;
  return {
    score: Math.round((1 - Math.min(1, overlapRatio / 0.2)) * 100),
    overlapRatio,
    flagged: flagged.slice(0, 10),
    passed: overlapRatio <= maxOverlap,
  };
}

export function lessonToPlainText(lesson) {
  return [
    lesson.title,
    lesson.summary,
    ...(lesson.sections || []).flatMap((s) => [s.heading, s.body]),
    ...(lesson.keyTakeaways || []),
    ...(lesson.actionSteps || []),
  ].join('\n');
}
