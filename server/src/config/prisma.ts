import { PrismaClient } from '@prisma/client';
import { env } from './env';
import { logger } from './logger';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: env.isTest ? [] : ['warn', 'error'],
  });

if (!env.isProduction) {
  globalForPrisma.prisma = prisma;
}

process.on('beforeExit', () => {
  void prisma.$disconnect().catch((error) => {
    logger.error({ error }, 'Failed to disconnect Prisma');
  });
});
