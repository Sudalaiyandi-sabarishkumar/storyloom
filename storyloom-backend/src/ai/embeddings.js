import OpenAI from 'openai';
import { config } from '../config/index.js';

// Standalone from ai/index.js's chat-provider map — embeddings are always
// OpenAI here regardless of AI_PROVIDER, since anthropic/gemini clients in
// this codebase don't expose an embeddings endpoint.
const client = new OpenAI({ apiKey: config.embeddings.apiKey });

/** Batched embedding call — pass up to a few hundred strings at once. */
export async function generateEmbeddings(texts) {
  const resp = await client.embeddings.create({
    model: config.embeddings.model,
    input: texts,
  });
  return resp.data.map((d) => d.embedding);
}

export async function generateEmbedding(text) {
  const [embedding] = await generateEmbeddings([text]);
  return embedding;
}
