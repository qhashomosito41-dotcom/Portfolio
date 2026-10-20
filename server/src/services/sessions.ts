import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import type { Request, Response } from 'express';
import type { AdminSession, AdminUser } from '@prisma/client';
import { env } from '../config/env';
import { prisma } from '../config/prisma';

const ttlMs = env.SESSION_TTL_HOURS * 60 * 60 * 1000;

export const hashToken = (token: string): string =>
  createHash('sha256').update(token).digest('hex');

export const safeEqual = (left: string, right: string): boolean => {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  if (leftBuffer.length !== rightBuffer.length) return false;
  return timingSafeEqual(leftBuffer, rightBuffer);
};

export const setSessionCookie = (res: Response, token: string) => {
  res.cookie(env.SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.cookieSecure,
    sameSite: 'lax',
    path: '/',
    maxAge: ttlMs,
  });
};

export const clearSessionCookie = (res: Response) => {
  res.clearCookie(env.SESSION_COOKIE_NAME, {
    httpOnly: true,
    secure: env.cookieSecure,
    sameSite: 'lax',
    path: '/',
  });
};

export const createAdminSession = async (adminUserId: number, req: Request) => {
  const token = randomBytes(32).toString('base64url');
  const csrfToken = randomBytes(24).toString('base64url');

  await prisma.adminSession.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  });

  const session = await prisma.adminSession.create({
    data: {
      tokenHash: hashToken(token),
      csrfToken,
      adminUserId,
      expiresAt: new Date(Date.now() + ttlMs),
      ipAddress: req.ip?.slice(0, 64) ?? null,
      userAgent: req.get('user-agent')?.slice(0, 255) ?? null,
    },
  });

  return { session, token, csrfToken };
};

export const getSessionFromRequest = async (
  req: Request,
): Promise<(AdminSession & { adminUser: AdminUser }) | null> => {
  const token = req.cookies?.[env.SESSION_COOKIE_NAME];
  if (!token || typeof token !== 'string') return null;

  const session = await prisma.adminSession.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { adminUser: true },
  });

  if (!session) return null;

  if (session.expiresAt.getTime() <= Date.now()) {
    await prisma.adminSession.delete({ where: { id: session.id } }).catch(() => undefined);
    return null;
  }

  if (Date.now() - session.lastUsedAt.getTime() > 5 * 60 * 1000) {
    await prisma.adminSession
      .update({ where: { id: session.id }, data: { lastUsedAt: new Date() } })
      .catch(() => undefined);
  }

  return session;
};

export const destroySession = async (sessionId: string) => {
  await prisma.adminSession.delete({ where: { id: sessionId } }).catch(() => undefined);
};

export const sessionTtlMs = ttlMs;
