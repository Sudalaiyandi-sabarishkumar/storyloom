import Anthropic from '@anthropic-ai/sdk';
import { config } from '../config/index.js';

const client = new Anthropic({ apiKey: config.ai.apiKey });

/**
 * Free-text generation (used for plot / scene prose).
 */
export async function generateText({ system, prompt, temperature = config.ai.temperature }) {
  const resp = await client.messages.create({
    model: config.ai.model,
    max_tokens: config.ai.maxTokens,
    temperature,
    system,
    messages: [{ role: 'user', content: prompt }],
  });
  return resp.content
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('\n')
    .trim();
}

/**
 * Structured JSON generation (used for review/ranking agents where the
 * component expects a specific shape). Instructs the model to return only
 * JSON, then parses and validates defensively.
 */
export async function generateJSON({ system, prompt, temperature = 0.4 }) {
  const jsonSystem = `${system}\n\nRespond with ONLY valid JSON. No prose, no markdown code fences, no preamble.`;
  const raw = await generateText({ system: jsonSystem, prompt, temperature });
  const cleaned = raw.replace(/^```json\s*|^```\s*|```$/g, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch (err) {
    throw new Error(`AI returned non-JSON output: ${err.message}\nRaw: ${cleaned.slice(0, 300)}`);
  }
}

export default client;
