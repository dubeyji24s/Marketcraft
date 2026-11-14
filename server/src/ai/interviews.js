// Summarizes an admin-provided interview transcript into takeaways + a short summary.
import { z } from 'zod';
import { betaZodOutputFormat } from '@anthropic-ai/sdk/helpers/beta/zod';
import { getClient, baseParams, assertNotRefused, wrapAIError, AIError } from './client.js';

const SummarySchema = z.object({
  summary: z.string().describe('3-5 sentence summary in your own words'),
  takeaways: z.array(z.string()).describe('4-6 practical, low-cost growth takeaways'),
  tags: z.array(z.string()).describe('2-5 short topic tags'),
});

export async function summarizeTranscript({ title, businessName, transcript }) {
  const client = getClient();
  if (!client) throw new AIError('AI summaries are disabled: set ANTHROPIC_API_KEY on the server.', 503);
  try {
    const res = await client.beta.messages.parse(
      baseParams({
        max_tokens: 8000,
        output_config: { effort: 'low', format: betaZodOutputFormat(SummarySchema) },
        system:
          'You summarize interviews with local business owners for a marketing school. Only include advice the speaker actually gave; do not add your own. Paraphrase rather than quote.',
        messages: [
          {
            role: 'user',
            content: `Interview: ${title}${businessName ? ` (${businessName})` : ''}\n\n<transcript>\n${transcript}\n</transcript>`,
          },
        ],
      }),
    );
    assertNotRefused(res);
    if (!res.parsed_output) throw new AIError('Summary was incomplete. Try again.');
    return res.parsed_output;
  } catch (err) {
    throw wrapAIError(err);
  }
}
