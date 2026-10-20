import { randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import path from 'node:path';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import express from 'express';
import pinoHttp from 'pino-http';
import { env } from './config/env';
import { logger } from './config/logger';
import { authRouter } from './routes/auth.routes';
import { publicRouter } from './routes/public.routes';
import { contactRouter } from './routes/contact.routes';
import { adminRouter } from './routes/admin.routes';
import { seoRouter } from './views/seo.routes';
import { corsMiddleware, helmetMiddleware, originCheck, apiLimiter } from './middleware/security';
import { errorHandler } from './middleware/errors';
import { AppError } from './utils/errors';

export const createApp = () => {
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  app.use(
    pinoHttp({
      logger,
      autoLogging: !env.isTest,
      genReqId: (_req, res) => {
        const id = randomUUID();
        res.setHeader('x-request-id', id);
        return id;
      },
      serializers: {
        req: (req) => ({ method: req.method, url: req.url, id: req.id }),
        res: (res) => ({ statusCode: res.statusCode }),
      },
    }),
  );
  app.use(helmetMiddleware);
  app.use('/api', corsMiddleware);
  app.use(compression());
  app.use(express.json({ limit: '200kb' }));
  app.use(express.urlencoded({ extended: false, limit: '200kb' }));
  app.use(cookieParser());
  app.use(originCheck);

  app.use('/api', apiLimiter);

  app.get('/api/health', (_req, res) => {
    res.json({ success: true, data: { status: 'ok', timestamp: new Date().toISOString() } });
  });

  app.use('/api/auth', authRouter);
  app.use('/api', publicRouter);
  app.use('/api/contact', contactRouter);
  app.use('/api/admin', adminRouter);
  app.use('/', seoRouter);

  app.use('/api', (req, _res, next) => {
    next(new AppError(404, 'NOT_FOUND', `API route ${req.method} ${req.path} was not found`));
  });

  const clientDist = [
    path.resolve(__dirname, '../../client/dist'),
    path.resolve(process.cwd(), '../client/dist'),
  ].find((candidate) => existsSync(path.join(candidate, 'index.html')));

  if (clientDist) {
    app.use(
      express.static(clientDist, {
        index: false,
        setHeaders: (res, filePath) => {
          if (filePath.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-store');
          } else {
            res.setHeader('Cache-Control', 'public, max-age=3600');
          }
        },
      }),
    );
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api/')) {
        next();
        return;
      }
      res.setHeader('Cache-Control', 'no-store');
      res.sendFile(path.join(clientDist, 'index.html'));
    });
  } else {
    app.get('/', (_req, res) => {
      res.json({
        success: true,
        data: {
          message: 'Portfolio API is running. Start the Vite client with npm run dev:client.',
        },
      });
    });
  }

  app.use(errorHandler);

  return app;
};
