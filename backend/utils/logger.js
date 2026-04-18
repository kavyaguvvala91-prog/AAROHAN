const { env, isProduction } = require('../config/env');

const log = (level, message, meta = {}) => {
  const timestamp = new Date().toISOString();

  if (isProduction) {
    const payload = {
      level,
      message,
      timestamp,
      ...meta,
    };

    process.stdout.write(`${JSON.stringify(payload)}\n`);
    return;
  }

  const serializedMeta =
    meta && Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';

  process.stdout.write(`[${timestamp}] ${level.toUpperCase()}: ${message}${serializedMeta}\n`);
};

const shouldLogDebug = () => !isProduction || env.logLevel === 'debug';

module.exports = {
  info: (message, meta) => log('info', message, meta),
  warn: (message, meta) => log('warn', message, meta),
  error: (message, meta) => log('error', message, meta),
  debug: (message, meta) => {
    if (shouldLogDebug()) {
      log('debug', message, meta);
    }
  },
};
