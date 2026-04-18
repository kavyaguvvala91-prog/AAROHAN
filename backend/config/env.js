const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET', 'FRONTEND_URL'];

const getEnv = (key, fallback = '') => {
  const value = process.env[key];
  return value === undefined ? fallback : String(value).trim();
};

const toPositiveInteger = (value, fallback) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

const validateEnv = () => {
  const missing = requiredEnvVars.filter((key) => !getEnv(key));

  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
};

const env = {
  nodeEnv: getEnv('NODE_ENV', 'development'),
  port: toPositiveInteger(getEnv('PORT'), 5000),
  mongoUri: getEnv('MONGO_URI'),
  jwtSecret: getEnv('JWT_SECRET'),
  frontendUrl: getEnv('FRONTEND_URL'),
  geminiApiKey: getEnv('GEMINI_API_KEY'),
  geminiModel: getEnv('GEMINI_MODEL', 'gemini-2.5-flash'),
  placesPrimaryApiBaseUrl: getEnv(
    'PLACES_PRIMARY_API_BASE_URL',
    'https://nominatim.openstreetmap.org'
  ),
  placesFallbackApiBaseUrl: getEnv(
    'PLACES_FALLBACK_API_BASE_URL',
    'https://photon.komoot.io'
  ),
  externalApiTimeoutMs: toPositiveInteger(getEnv('EXTERNAL_API_TIMEOUT_MS'), 5000),
  rateLimitWindowMs: toPositiveInteger(getEnv('RATE_LIMIT_WINDOW_MS'), 15 * 60 * 1000),
  rateLimitMax: toPositiveInteger(getEnv('RATE_LIMIT_MAX'), 200),
  jsonBodyLimit: getEnv('JSON_BODY_LIMIT', '1mb'),
  logLevel: getEnv('LOG_LEVEL', 'info'),
};

const isProduction = env.nodeEnv === 'production';

module.exports = {
  env,
  isProduction,
  validateEnv,
};
