import { Router } from 'express';
import { getAuthSession, login, logout } from '../controllers/auth';
import { loginLimiter } from '../middleware/security';
import { requireAdmin, requireCsrf } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { loginSchema } from '../validators/entities';

export const authRouter = Router();

authRouter.get('/session', getAuthSession);
authRouter.post('/login', loginLimiter, validateBody(loginSchema), login);
authRouter.post('/logout', requireAdmin, requireCsrf, logout);
