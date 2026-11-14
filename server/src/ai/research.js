// AI Research Engine
//   1. RESEARCH: Claude searches a fixed allow-list of high-authority business sources
//      and writes research notes. We capture the source URLs/titles and the excerpts it cited.
//   2. COMPOSE: a second call turns the notes into an ORIGINAL structured lesson
//      (structured output, validated with zod) that cites sources by index.
//   3. GUARDRAIL: deterministic n-gram overlap check against the cited excerpts; if the
//      lesson reuses source wording, one rewrite pass is requested. The result is stored
//      with its originality report so admins can review before publishing.
import { z } from 'zod';
import { betaZodOutputFormat } from '@anthropic-ai/sdk/helpers/beta/zod';
import { getClient, baseParams, assertNotRefused, wrapAIError, AIError } from './client.js';
import { checkOriginality, lessonToPlainText } from './originality.js';

export const TRUSTED_DOMAINS = (process.env.RESEARCH_DOMAINS ||
  'sba.gov,ftc.gov,score.org,hbr.org,census.gov,pewresearch.org,thinkwithgoogle.com,business.google.com,hubspot.com,mailchimp.com,shopify.com,ja.org,nfib.com,uschamber.com')
  .split(',')
  .map((d) => d.trim())
  .filter(Boolean);

const AUDIENCE = {
  kid: 'a young entrepreneur aged roughly 9-15. Use short sentences, everyday words, fun relatable examples (lemonade stands, handmade crafts, school fairs). Always remind them to involve a parent or guardian for money, online accounts, and meeting strangers.',
  adult: 'an adult small-business owner with a tight budget and little marketing background. Practical, plain language, real-world local-business examples.',
  professional: 'a marketing or business professional. Concise, precise terminology, include metrics and how to measure results.',
  admin: 'a general audience of small creators and business owners.',
};

export const LessonSchema = z.object({
  title: z.string().describe('Catchy, original lesson title'),
  summary: z.string().describe('2-3 sentence overview in your own words'),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  estimatedMinutes: z.number().int(),
  costLevel: z.enum(['free', 'under $50', 'under $200']),
  sections: z.array(
    z.object({
      heading: z.string(),
      body: z.string().describe('Original explanation, 80-180 words, may use simple markdown lists'),
      sourceRefs: z.array(z.number().int()).describe('Indexes into the provided source list that support this section'),
    }),
  ),
  keyTakeaways: z.array(z.string()),
  actionSteps: z.array(z.string()).describe('Concrete low-cost steps the learner can do this week'),
  quiz: z.array(
    z.object({
      question: z.string(),
      options: z.array(z.string()),
      answerIndex: z.number().int(),
    }),
  ),
});

const COMPOSE_SYSTEM = `You are the curriculum writer for Marketcraft, a school that teaches low-cost, direct-to-consumer marketing.

Originality rules (these protect creators' copyrights and are mandatory):
- Teach the IDEAS from the research notes, never the wording. Explain every concept from scratch in your own sentences, structure and examples.
- Do not reproduce any run of more than 6 consecutive words from a source. No direct quotes.
- Invent fresh, original examples; do not reuse a source's examples, case studies, lists or headings.
- Every factual claim (statistics, legal rules, platform policies) must be supported by a source in the provided list; reference it via sourceRefs. If the notes don't support a claim, leave it out.
- Never invent statistics, sources or URLs.

Teaching rules:
- Focus on strategies a small creator can run for free or very cheaply: word of mouth, referrals, community events, social content, email lists, partnerships, flyers/signage, local listings.
- Quiz answers must be unambiguous; answerIndex is zero-based.`;

function collectSources(content, sources, excerpts) {
  for (const block of content) {
    if (block.type === 'web_search_tool_result' && Array.isArray(block.content)) {
      for (const r of block.content) {
        if (r.type === 'web_search_result' && !sources.some((s) => s.url === r.url)) {
          sources.push({ url: r.url, title: r.title, pageAge: r.page_age ?? null });
        }
      }
    }
    if (block.type === 'text') {
      for (const c of block.citations ?? []) {
        if (c.cited_text) excerpts.push(c.cited_text);
        if (c.url && !sources.some((s) => s.url === c.url)) sources.push({ url: c.url, title: c.title, pageAge: null });
      }
    }
  }
}

async function research(client, topic, role) {
  const messages = [
    {
      role: 'user',
      content: `Research this marketing topic for a lesson aimed at ${AUDIENCE[role] ?? AUDIENCE.adult}

Topic: ${topic}

Search the trusted sources, then write detailed research notes: core concepts, why they work, low-cost tactics, common mistakes, and any statistics or legal/compliance points (e.g. FTC endorsement rules) with the source each came from.`,
    },
  ];
  const sources = [];
  const excerpts = [];
  let notes = '';

  // pause_turn: the server-side search loop hit its iteration cap; resend to continue.
  for (let i = 0; i < 4; i++) {
    const res = await client.beta.messages.create(
      baseParams({
        max_tokens: 16000,
        output_config: { effort: 'medium' },
        tools: [{ type: 'web_search_20260209', name: 'web_search', max_uses: 6, allowed_domains: TRUSTED_DOMAINS }],
        messages,
      }),
    );
    assertNotRefused(res);
    collectSources(res.content, sources, excerpts);
    notes += res.content.filter((b) => b.type === 'text').map((b) => b.text).join('');
    if (res.stop_reason !== 'pause_turn') break;
    messages.push({ role: 'assistant', content: res.content });
  }

  if (sources.length === 0) {
    throw new AIError('No trusted sources were found for that topic. Try a broader marketing topic.', 422);
  }
  return { notes, sources: sources.slice(0, 12), excerpts };
}

async function compose(client, { topic, role, notes, sources, rewriteHint }) {
  const sourceList = sources.map((s, i) => `[${i}] ${s.title} — ${s.url}`).join('\n');
  const content = `Write an original lesson on "${topic}" for ${AUDIENCE[role] ?? AUDIENCE.adult}

SOURCES (cite by index):
${sourceList}

RESEARCH NOTES:
${notes}
${rewriteHint ? `\nREVISION REQUIRED: a plagiarism check found these phrases copied from the sources. Rewrite the whole lesson so none of this wording appears:\n${rewriteHint}` : ''}`;

  const res = await client.beta.messages.parse(
    baseParams({
      max_tokens: 16000,
      output_config: { effort: 'medium', format: betaZodOutputFormat(LessonSchema) },
      system: COMPOSE_SYSTEM,
      messages: [{ role: 'user', content }],
    }),
  );
  assertNotRefused(res);
  if (!res.parsed_output) throw new AIError('The AI returned an incomplete lesson. Please try again.');
  return res.parsed_output;
}

/** Full pipeline. Returns a lesson draft with attribution + originality report. */
export async function generateLesson({ topic, role = 'adult' }) {
  const client = getClient();
  if (!client) throw new AIError('AI research is disabled: set ANTHROPIC_API_KEY on the server.', 503);

  try {
    const { notes, sources, excerpts } = await research(client, topic, role);
    // compare against both the cited excerpts and the notes (which may paraphrase closely)
    const reference = [...excerpts, notes];

    let lesson = await compose(client, { topic, role, notes, sources });
    let originality = checkOriginality(lessonToPlainText(lesson), reference);
    let revisions = 0;

    if (!originality.passed) {
      revisions = 1;
      lesson = await compose(client, { topic, role, notes, sources, rewriteHint: originality.flagged.join('\n') });
      originality = checkOriginality(lessonToPlainText(lesson), reference);
    }

    const validRefs = (refs) => [...new Set(refs)].filter((r) => r >= 0 && r < sources.length);
    return {
      ...lesson,
      sections: lesson.sections.map((s) => ({ ...s, sourceRefs: validRefs(s.sourceRefs) })),
      sources,
      audience: role,
      topic,
      originality: { ...originality, revisions, checkedAt: new Date().toISOString() },
      generatedBy: 'ai',
    };
  } catch (err) {
    throw wrapAIError(err);
  }
}
