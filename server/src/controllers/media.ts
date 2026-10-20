import type { NextFunction, Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError, notFound } from '../utils/errors';
import { resolveStoredFile } from '../services/storage';

const PUBLIC_KINDS = new Set(['profiles', 'projects']);

export const getMedia = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const kind = req.params.kind;
  const filename = req.params.filename;

  if (!PUBLIC_KINDS.has(kind) || !/^[A-Za-z0-9._-]+$/.test(filename) || filename.includes('..')) {
    throw notFound('Media file not found');
  }

  const absolutePath = resolveStoredFile(`${kind}/${filename}`);
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  res.sendFile(absolutePath, (error) => {
    if (error) next(error);
  });
});

export const getAdminCertificate = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const certification = await prisma.certification.findUnique({ where: { id } });
  if (!certification?.certificatePath) throw notFound('Certificate not found');

  const absolutePath = resolveStoredFile(certification.certificatePath);
  const isPdf = certification.certificatePath.toLowerCase().endsWith('.pdf');
  res.setHeader('Content-Disposition', 'inline');
  res.setHeader('Cache-Control', 'private, no-store');
  if (isPdf) res.type('application/pdf');
  res.sendFile(absolutePath);
});

export const assertPublicMediaPath = (filePath: string) => {
  if (!/^[A-Za-z0-9/._-]+$/.test(filePath) || filePath.includes('..')) {
    throw new AppError(400, 'INVALID_PATH', 'Invalid media path');
  }
};
