import { GoogleGenAI } from '@google/genai';
import { config } from '../config/index.js';

const client = new GoogleGenAI({ apiKey: config.ai.apiKey });

/**
 * Free-text generation (used for plot / scene prose).
 * Same signature as anthropicClient/openaiClient's generateText so agents
 * don't care which provider is active.
 */
export async function generateText({ system, prompt, temperature = config.ai.temperature }) {
  const resp = await client.models.generateContent({
    model: config.ai.model,
    contents: prompt,
    config: {
      systemInstruction: system,
      temperature,
      maxOutputTokens: config.ai.maxTokens,
    },
  });
  return (resp.text || '').trim();
}

/**
 * Structured JSON generation (used for review/ranking agents).
 * Uses Gemini's responseMimeType: 'application/json' so we skip the
 * fence-stripping hack the Anthropic path needs.
 */
export async function generateJSON({ system, prompt, temperature = 0.4 }) {
  const resp = await client.models.generateContent({
    model: config.ai.model,
    contents: prompt,
    config: {
      systemInstruction: `${system}\n\nRespond with a single JSON object or array as instructed.`,
      temperature,
      maxOutputTokens: config.ai.maxTokens,
      responseMimeType: 'application/json',
    },
  });
  const raw = (resp.text || '').trim();
  try {
    return JSON.parse(raw);
  } catch (err) {
    throw new Error(`AI returned non-JSON output: ${err.message}\nRaw: ${raw.slice(0, 300)}`);
  }
}

export default client;
