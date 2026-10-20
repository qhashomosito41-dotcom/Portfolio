import type { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { asyncHandler } from '../utils/asyncHandler';
import { unauthorized } from '../utils/errors';
import { getDummyHash, verifyPassword } from '../services/passwords';
import {
  clearSessionCookie,
  createAdminSession,
  destroySession,
  getSessionFromRequest,
  setSessionCookie,
} from '../services/sessions';

export const getAuthSession = asyncHandler(async (req: Request, res: Response) => {
  const session = await getSessionFromRequest(req);
  if (!session) {
    res.json({ success: true, data: { authenticated: false } });
    return;
  }
  res.json({
    success: true,
    data: {
      authenticated: true,
      admin: {
        id: session.adminUser.id,
        name: session.adminUser.name,
        email: session.adminUser.email,
      },
      csrfToken: session.csrfToken,
      expiresAt: session.expiresAt,
    },
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body as { email: string; password: string };

  const admin = await prisma.adminUser.findUnique({ where: { email: email.toLowerCase() } });
  if (!admin) {
    await verifyPassword(await getDummyHash(), password);
    throw unauthorized('Invalid email address or password');
  }

  const valid = await verifyPassword(admin.passwordHash, password);
  if (!valid) {
    throw unauthorized('Invalid email address or password');
  }

  await prisma.adminSession.deleteMany({
    where: { adminUserId: admin.id, expiresAt: { lt: new Date() } },
  });

  const { session, token, csrfToken } = await createAdminSession(admin.id, req);
  setSessionCookie(res, token);

  await prisma.adminUser.update({
    where: { id: admin.id },
    data: { lastLoginAt: new Date() },
  });

  const oldSessions = await prisma.adminSession.findMany({
    where: { adminUserId: admin.id },
    orderBy: { createdAt: 'desc' },
    skip: 10,
    select: { id: true },
  });
  if (oldSessions.length > 0) {
    await prisma.adminSession.deleteMany({
      where: { id: { in: oldSessions.map((item) => item.id) } },
    });
  }

  res.json({
    success: true,
    data: {
      authenticated: true,
      admin: { id: admin.id, name: admin.name, email: admin.email },
      csrfToken,
      expiresAt: session.expiresAt,
    },
  });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  if (req.adminSession) {
    await destroySession(req.adminSession.id);
  }
  clearSessionCookie(res);
  res.json({ success: true, data: { message: 'Signed out successfully' } });
});
