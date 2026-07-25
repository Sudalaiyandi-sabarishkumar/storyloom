import 'dotenv/config';

function required(name, fallback = undefined) {
  const v = process.env[name] ?? fallback;
  if (v === undefined) {
    // Don't throw at import time in dev — let the health check surface it.
    console.warn(`[config] Missing env var: ${name}`);
  }
  return v;
}

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 8080),
  corsOrigin: process.env.CORS_ORIGIN || '*',

  ai: {
    provider: (process.env.AI_PROVIDER || 'anthropic').toLowerCase(), // 'anthropic' | 'openai'
    apiKey: process.env.AI_PROVIDER === 'openai'
      ? required('OPENAI_API_KEY')
      : required('ANTHROPIC_API_KEY'),
    model: process.env.AI_MODEL
      || (process.env.AI_PROVIDER === 'openai' ? 'gpt-4o' : 'claude-sonnet-5'),
    maxTokens: Number(process.env.AI_MAX_TOKENS || 1500),
    temperature: Number(process.env.AI_TEMPERATURE || 0.9),
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
};
