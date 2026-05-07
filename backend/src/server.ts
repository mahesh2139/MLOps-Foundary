import dotenv from 'dotenv';
import pino from 'pino';
import app from './app';
import { getPool } from './db/pool';
import { migrate } from './db/migrate';

dotenv.config();

const logger = pino();
const PORT = process.env.PORT || 5000;

async function start() {
  const pool = getPool();
  if (pool && process.env.SKIP_DB_MIGRATIONS !== 'true') {
    try {
      await migrate(pool);
      logger.info('Database migrations applied');
    } catch (err) {
      logger.error({ err }, 'Failed to apply migrations (continuing)');
    }
  }

  app.listen(PORT, () => {
    logger.info({ port: PORT }, 'MLOps Studio Backend started');
    // eslint-disable-next-line no-console
    console.log(`✅ Backend running on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  logger.error({ err }, 'Fatal startup error');
  process.exit(1);
});

