import { config } from '../config/index.js';
import * as anthropic from './anthropicClient.js';
import * as openai from './openaiClient.js';
import * as gemini from './geminiClient.js';

const providers = {
  anthropic,
  openai,
  gemini,
};

const active = providers[config.ai.provider];
if (!active) {
  throw new Error(`Unknown AI_PROVIDER "${config.ai.provider}" — expected "anthropic", "openai", or "gemini"`);
}

export const generateText = active.generateText;
export const generateJSON = active.generateJSON;
