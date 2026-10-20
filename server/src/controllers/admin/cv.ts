import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { AppError } from '../../utils/errors';
import {
  cvAbsolutePath,
  cvDownloadName,
  getActiveCvFile,
  getAdminCv,
  removeCv,
  updateCv,
  uploadCv,
} from '../../services/cv';

export const getCurrentCv = asyncHandler(async (_req: Request, res: Response) => {
  const cv = await getAdminCv();
  res.json({ success: true, data: cv });
});

export const upload = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) throw new AppError(422, 'FILE_REQUIRED', 'Select a PDF CV to upload');
  const { title, isPublic } = req.body as { title: string; isPublic: boolean };
  const cv = await uploadCv(req.file.buffer, req.file.originalname, title, isPublic);
  res.status(201).json({ success: true, data: cv });
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const cv = await updateCv(Number(req.params.id), req.body);
  res.json({ success: true, data: cv });
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await removeCv(Number(req.params.id));
  res.json({ success: true, data: { message: 'CV removed' } });
});

export const download = asyncHandler(async (req: Request, res: Response) => {
  const cv = await getActiveCvFile(Number(req.params.id));
  res.download(cvAbsolutePath(cv.filePath), cvDownloadName(cv.title));
});

export const preview = asyncHandler(async (req: Request, res: Response) => {
  const cv = await getActiveCvFile(Number(req.params.id));
  res.setHeader('Content-Disposition', 'inline');
  res.setHeader('Cache-Control', 'private, no-store');
  res.type('application/pdf');
  res.sendFile(cvAbsolutePath(cv.filePath));
});
