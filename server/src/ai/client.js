import Anthropic from '@anthropic-ai/sdk';
import { config } from '../config.js';

let client = null;

export function getClient() {
  if (!config.aiEnabled) return null;
  client ??= new Anthropic();
  return client;
}

/**
 * Shared request options. Server-side refusal fallbacks are on by default: if the
 * primary model's safety classifier declines, the API reroutes the same request
 * inside the same call. Remove `betas`/`fallbacks` to opt out.
 */
export function baseParams(extra = {}) {
  return {
    model: config.aiModel,
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    ...extra,
  };
}

export class AIError extends Error {
  constructor(message, status = 502) {
    super(message);
    this.status = status;
  }
}

/** Translate SDK errors into user-safe messages; keep the detail in server logs. */
export function wrapAIError(err) {
  console.error('[ai]', err);
  if (err instanceof AIError) return err;
  if (err instanceof Anthropic.RateLimitError) return new AIError('The AI coach is busy right now. Try again in a minute.', 429);
  if (err instanceof Anthropic.AuthenticationError) return new AIError('AI is not configured correctly on the server.', 503);
  if (err instanceof Anthropic.BadRequestError) return new AIError('The AI could not process that request.', 400);
  if (err instanceof Anthropic.APIConnectionError) return new AIError('Could not reach the AI service. Try again shortly.', 503);
  if (err instanceof Anthropic.APIError) return new AIError('The AI service had a problem. Try again shortly.', 502);
  return new AIError('Unexpected AI error.', 500);
}

export function assertNotRefused(response) {
  if (response.stop_reason === 'refusal') {
    throw new AIError('The AI declined this request. Try rephrasing it.', 422);
  }
}
