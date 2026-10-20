import type { NextFunction, Request, Response } from 'express';
import type { ZodTypeAny } from 'zod';
import { unprocessable } from '../utils/errors';

export const validateBody =
  (schema: ZodTypeAny) => (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return next(
        unprocessable('Please correct the highlighted fields', result.error.flatten().fieldErrors),
      );
    }
    req.body = result.data;
    return next();
  };

export const validateQuery =
  (schema: ZodTypeAny) => (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      return next(unprocessable('Invalid query parameters', result.error.flatten().fieldErrors));
    }
    req.validatedQuery = result.data;
    return next();
  };

export const validateParams =
  (schema: ZodTypeAny) => (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.params);
    if (!result.success) {
      return next(unprocessable('Invalid request parameters', result.error.flatten().fieldErrors));
    }
    req.params = result.data as typeof req.params;
    return next();
  };
