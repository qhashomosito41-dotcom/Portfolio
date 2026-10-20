import type { NextFunction, Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { forbidden, unauthorized } from '../utils/errors';
import { getSessionFromRequest, safeEqual } from '../services/sessions';

export const requireAdmin = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const session = await getSessionFromRequest(req);
    if (!session) {
      throw unauthorized('Your session has expired. Please sign in again.');
    }
    req.admin = session.adminUser;
    req.adminSession = session;
    next();
  },
);

export const requireCsrf = (req: Request, _res: Response, next: NextFunction) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    next();
    return;
  }
  const header = req.get('x-csrf-token');
  if (!header || !req.adminSession || !safeEqual(header, req.adminSession.csrfToken)) {
    next(forbidden('Your security token is missing or invalid. Refresh the page and try again.'));
    return;
  }
  next();
};
