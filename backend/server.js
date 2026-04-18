require('dotenv').config({ path: process.env.DOTENV_CONFIG_PATH || '.env' });
const connectDB = require('./config/db');
const { env, validateEnv } = require('./config/env');
const app = require('./app');
const logger = require('./utils/logger');

validateEnv();
connectDB();

const PORT = env.port;

app.listen(PORT, () => {
  logger.info('Server started', {
    port: PORT,
    environment: env.nodeEnv,
  });
});
