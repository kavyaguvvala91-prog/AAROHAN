const { isProduction } = require('../config/env');
const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || (res.statusCode >= 400 ? res.statusCode : 500);

  logger.error('Unhandled request error', {
    method: req.method,
    path: req.originalUrl,
    statusCode,
    message: err.message,
    stack: isProduction ? undefined : err.stack,
  });

  res.status(statusCode).json({
    success: false,
    message:
      statusCode >= 500 && isProduction
        ? 'An unexpected server error occurred.'
        : err.message || 'Internal Server Error',
  });
};

module.exports = errorHandler;
