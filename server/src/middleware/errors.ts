import type { NextFunction, Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import multer from 'multer';
import { ZodError } from 'zod';
import { logger } from '../config/logger';
import { env } from '../config/env';
import { AppError } from '../utils/errors';

export const notFoundHandler = (req: Request, _res: Response, next: NextFunction) => {
  next(new AppError(404, 'NOT_FOUND', `Route ${req.method} ${req.path} was not found`));
};

export const errorHandler = (error: unknown, req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof AppError) {
    res.status(error.status).json({
      success: false,
      error: { code: error.code, message: error.message, details: error.details },
    });
    return;
  }

  if (error instanceof multer.MulterError) {
    const message =
      error.code === 'LIMIT_FILE_SIZE'
        ? 'The uploaded file is too large'
        : error.code === 'LIMIT_UNEXPECTED_FILE'
          ? 'Unexpected file upload field'
          : 'The file upload could not be processed';
    res.status(400).json({ success: false, error: { code: 'UPLOAD_ERROR', message } });
    return;
  }

  if (error instanceof ZodError) {
    res.status(422).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Please correct the highlighted fields',
        details: error.flatten().fieldErrors,
      },
    });
    return;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      res.status(409).json({
        success: false,
        error: { code: 'CONFLICT', message: 'A record with those details already exists' },
      });
      return;
    }
    if (error.code === 'P2025') {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'The requested record no longer exists' },
      });
      return;
    }
  }

  if (error instanceof SyntaxError && 'body' in error) {
    res.status(400).json({
      success: false,
      error: { code: 'INVALID_JSON', message: 'The request body contains invalid JSON' },
    });
    return;
  }

  logger.error(
    {
      err: error,
      method: req.method,
      path: req.path,
      requestId: res.getHeader('x-request-id'),
    },
    'Unhandled request error',
  );

  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred. Please try again later.',
      ...(env.isProduction || !(error instanceof Error) ? {} : { detail: error.message }),
    },
  });
};
