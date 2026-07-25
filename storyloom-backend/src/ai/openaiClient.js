import OpenAI from 'openai';
import { config } from '../config/index.js';

const client = new OpenAI({ apiKey: config.ai.apiKey });

/**
 * Free-text generation (used for plot / scene prose).
 * Same signature as anthropicClient.generateText so agents don't care
 * which provider is active.
 */
export async function generateText({ system, prompt, temperature = config.ai.temperature }) {
  const resp = await client.chat.completions.create({
    model: config.ai.model,
    temperature,
    max_tokens: config.ai.maxTokens,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: prompt },
    ],
  });
  return (resp.choices[0]?.message?.content || '').trim();
}

/**
 * Structured JSON generation (used for review/ranking agents).
 * Uses OpenAI's response_format: json_object so we skip the fence-stripping
 * hack the Anthropic path needs.
 */
export async function generateJSON({ system, prompt, temperature = 0.4 }) {
  const resp = await client.chat.completions.create({
    model: config.ai.model,
    temperature,
    max_tokens: config.ai.maxTokens,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: `${system}\n\nRespond with a single JSON object or array as instructed.` },
      { role: 'user', content: prompt },
    ],
  });
  const raw = (resp.choices[0]?.message?.content || '').trim();
  try {
    return JSON.parse(raw);
  } catch (err) {
    throw new Error(`AI returned non-JSON output: ${err.message}\nRaw: ${raw.slice(0, 300)}`);
  }
}

export default client;
