import { createApp } from './app';
import { env } from './config/env';
import { logger } from './config/logger';
import { prisma } from './config/prisma';
import { ensureStorage } from './services/storage';

const start = async () => {
  await ensureStorage();
  const app = createApp();
  const server = app.listen(env.PORT, () => {
    logger.info(
      { port: env.PORT, environment: env.NODE_ENV },
      `Portfolio API listening on http://localhost:${env.PORT}`,
    );
  });

  const cleanup = setInterval(
    () => {
      void prisma.adminSession
        .deleteMany({ where: { expiresAt: { lt: new Date() } } })
        .catch((error) => logger.warn({ err: error }, 'Session cleanup failed'));
    },
    60 * 60 * 1000,
  );
  cleanup.unref();

  const shutdown = async (signal: string) => {
    logger.info({ signal }, 'Shutting down');
    clearInterval(cleanup);
    server.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10000).unref();
  };

  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
};

start().catch((error) => {
  logger.error({ err: error }, 'Failed to start server');
  process.exit(1);
});
