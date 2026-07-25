import { config } from '../config/index.js';
import * as anthropic from './anthropicClient.js';
import * as openai from './openaiClient.js';

const providers = {
  anthropic,
  openai,
};

const active = providers[config.ai.provider];
if (!active) {
  throw new Error(`Unknown AI_PROVIDER "${config.ai.provider}" — expected "anthropic" or "openai"`);
}

export const generateText = active.generateText;
export const generateJSON = active.generateJSON;
