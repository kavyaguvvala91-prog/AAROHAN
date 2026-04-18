const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { env, isProduction } = require('./config/env');
const authMiddleware = require('./middleware/authMiddleware');
const notFound = require('./middleware/notFound');
const requestLogger = require('./middleware/requestLogger');
const authRoutes = require('./routes/authRoutes');
const collegeRoutes = require('./routes/collegeRoutes');
const chatRoutes = require('./routes/chatRoutes');
const favoritesRoutes = require('./routes/favoritesRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.set('trust proxy', isProduction ? 1 : 0);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || env.frontendUrls.includes(origin)) {
        return callback(null, true);
      }

      const error = new Error('CORS policy does not allow this origin.');
      error.statusCode = 403;
      return callback(error);
    },
    credentials: true,
  })
);
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);
app.use(
  rateLimit({
    windowMs: env.rateLimitWindowMs,
    max: env.rateLimitMax,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: 'Too many requests. Please try again later.',
    },
  })
);
app.use(express.json({ limit: env.jsonBodyLimit }));
app.use(requestLogger);

app.get('/', (req, res) => {
  res.json({ message: 'College Discovery API is running' });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'ok',
    environment: env.nodeEnv,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/favorites', authMiddleware, favoritesRoutes);
app.use('/api/chat', authMiddleware, chatRoutes);
app.use('/api', authMiddleware, collegeRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
