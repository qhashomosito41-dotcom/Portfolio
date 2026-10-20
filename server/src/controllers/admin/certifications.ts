import type { Request, Response } from 'express';
import { prisma } from '../../config/prisma';
import { asyncHandler } from '../../utils/asyncHandler';
import { AppError, notFound } from '../../utils/errors';
import { nextSortOrder, reorderRecords } from '../../utils/reorder';
import { toAdminCertification } from '../../services/serializers';
import { deleteStoredFile, detectImage, detectPdf, saveBuffer } from '../../services/storage';

const mapCertification = (body: any) => ({
  title: body.title,
  provider: body.provider,
  completionDate: body.completionDate,
  description: body.description,
  credentialId: body.credentialId,
  verificationUrl: body.verificationUrl,
  published: body.published,
});

export const listCertifications = asyncHandler(async (_req: Request, res: Response) => {
  const certifications = await prisma.certification.findMany({
    orderBy: [{ sortOrder: 'asc' }, { completionDate: 'desc' }],
  });
  res.json({ success: true, data: certifications.map(toAdminCertification) });
});

export const createCertification = asyncHandler(async (req: Request, res: Response) => {
  const certification = await prisma.certification.create({
    data: {
      ...mapCertification(req.body),
      sortOrder: req.body.sortOrder ?? (await nextSortOrder('certification')),
    },
  });
  res.status(201).json({ success: true, data: toAdminCertification(certification) });
});

export const updateCertification = asyncHandler(async (req: Request, res: Response) => {
  const existing = await prisma.certification.findUnique({
    where: { id: Number(req.params.id) },
  });
  if (!existing) throw notFound('Certification not found');
  const certification = await prisma.certification.update({
    where: { id: existing.id },
    data: {
      ...mapCertification(req.body),
      ...(req.body.sortOrder !== undefined ? { sortOrder: req.body.sortOrder } : {}),
    },
  });
  res.json({ success: true, data: toAdminCertification(certification) });
});

export const deleteCertification = asyncHandler(async (req: Request, res: Response) => {
  const certification = await prisma.certification.findUnique({
    where: { id: Number(req.params.id) },
  });
  if (!certification) throw notFound('Certification not found');
  await prisma.certification.delete({ where: { id: certification.id } });
  await deleteStoredFile(certification.certificatePath);
  res.json({ success: true, data: { message: 'Certification deleted' } });
});

export const reorderCertifications = asyncHandler(async (req: Request, res: Response) => {
  await reorderRecords('certification', req.body.ids);
  res.json({ success: true, data: { message: 'Certification order updated' } });
});

export const uploadCertificate = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) throw new AppError(422, 'FILE_REQUIRED', 'Select a certificate file to upload');
  const certification = await prisma.certification.findUnique({
    where: { id: Number(req.params.id) },
  });
  if (!certification) throw notFound('Certification not found');

  const detected = detectImage(req.file.buffer) ?? detectPdf(req.file.buffer);
  if (!detected) {
    throw new AppError(422, 'INVALID_FILE_TYPE', 'Upload a PNG, JPEG, WebP, GIF, or PDF file');
  }

  const filePath = await saveBuffer(req.file.buffer, 'certifications', detected);
  try {
    const updated = await prisma.certification.update({
      where: { id: certification.id },
      data: { certificatePath: filePath },
    });
    await deleteStoredFile(certification.certificatePath);
    res.json({ success: true, data: toAdminCertification(updated) });
  } catch (error) {
    await deleteStoredFile(filePath);
    throw error;
  }
});

export const removeCertificate = asyncHandler(async (req: Request, res: Response) => {
  const certification = await prisma.certification.findUnique({
    where: { id: Number(req.params.id) },
  });
  if (!certification) throw notFound('Certification not found');
  const updated = await prisma.certification.update({
    where: { id: certification.id },
    data: { certificatePath: null },
  });
  await deleteStoredFile(certification.certificatePath);
  res.json({ success: true, data: toAdminCertification(updated) });
});
