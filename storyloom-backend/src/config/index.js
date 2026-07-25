import 'dotenv/config';

function required(name, fallback = undefined) {
  const v = process.env[name] ?? fallback;
  if (v === undefined) {
    // Don't throw at import time in dev — let the health check surface it.
    console.warn(`[config] Missing env var: ${name}`);
  }
  return v;
}

// One entry per provider registered in ai/index.js's `providers` map.
const AI_PROVIDERS = {
  anthropic: { apiKeyEnv: 'ANTHROPIC_API_KEY', defaultModel: 'claude-sonnet-5' },
  openai: { apiKeyEnv: 'OPENAI_API_KEY', defaultModel: 'gpt-4o' },
  gemini: { apiKeyEnv: 'GEMINI_API_KEY', defaultModel: 'gemini-3.6-flash' },
};

const aiProvider = (process.env.AI_PROVIDER || 'anthropic').toLowerCase();
const aiProviderConfig = AI_PROVIDERS[aiProvider] || AI_PROVIDERS.anthropic;

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 8080),
  corsOrigin: process.env.CORS_ORIGIN || '*',

  ai: {
    provider: aiProvider, // 'anthropic' | 'openai' | 'gemini'
    apiKey: required(aiProviderConfig.apiKeyEnv),
    model: process.env.AI_MODEL || aiProviderConfig.defaultModel,
    maxTokens: Number(process.env.AI_MAX_TOKENS || 1500),
    temperature: Number(process.env.AI_TEMPERATURE || 0.9),
  },

  // Listener-panel RAG (rankingAgent grounding) always embeds via OpenAI,
  // independent of which AI_PROVIDER is chosen for chat generation above.
  embeddings: {
    apiKey: required('OPENAI_API_KEY'),
    model: 'text-embedding-3-small',
  },

  databricks: {
    serverHostname: required('DATABRICKS_SERVER_HOSTNAME'),
    httpPath: required('DATABRICKS_HTTP_PATH'),
    token: required('DATABRICKS_TOKEN'),
    catalog: process.env.DATABRICKS_CATALOG || 'storyloom',
    schema: process.env.DATABRICKS_SCHEMA || 'prod',
    servingEndpointUrl: process.env.DATABRICKS_SERVING_ENDPOINT_URL || null,
    servingToken: process.env.DATABRICKS_SERVING_TOKEN || null,
  },

  generation: {
    maxHistory: Number(process.env.MAX_GENERATION_HISTORY || 10),
  },

  auth: {
    jwtSecret: required('JWT_SECRET', 'dev-insecure-secret-change-me'),
    tokenExpiry: process.env.JWT_EXPIRY || '7d',
  },

  // The one Director account — seeded by `npm run db:migrate`, never
  // created via public signup (signup always creates role: 'creator').
  director: {
    username: process.env.DIRECTOR_USERNAME || 'director',
    password: process.env.DIRECTOR_PASSWORD,
    displayName: process.env.DIRECTOR_DISPLAY_NAME || 'Director',
  },
};
