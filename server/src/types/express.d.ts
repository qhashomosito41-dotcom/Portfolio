import type { AdminSession, AdminUser } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      admin?: AdminUser;
      adminSession?: AdminSession;
      validatedQuery?: unknown;
    }
  }
}

export {};
