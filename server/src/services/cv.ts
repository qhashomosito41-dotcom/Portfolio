import { prisma } from '../config/prisma';
import { AppError } from '../utils/errors';
import {
  deleteStoredFile,
  detectPdf,
  resolveStoredFile,
  safeDownloadName,
  saveBuffer,
} from './storage';
import { toAdminCv } from './serializers';

export const getAdminCv = async () => {
  const cv = await prisma.cVDocument.findFirst({
    where: { isActive: true },
    orderBy: { uploadedAt: 'desc' },
  });
  return cv ? toAdminCv(cv) : null;
};

export const uploadCv = async (
  buffer: Buffer,
  originalName: string,
  title: string,
  isPublic: boolean,
) => {
  const detected = detectPdf(buffer);
  if (!detected) {
    throw new AppError(422, 'INVALID_FILE_TYPE', 'The uploaded file is not a valid PDF document');
  }

  const filePath = await saveBuffer(buffer, 'cv', detected);
  try {
    const created = await prisma.$transaction(async (tx) => {
      const previous = await tx.cVDocument.findMany({ select: { id: true, filePath: true } });
      const cv = await tx.cVDocument.create({
        data: {
          title,
          filePath,
          originalName: originalName.slice(0, 255),
          mimeType: detected.mimeType,
          fileSize: buffer.length,
          isActive: true,
          isPublic,
        },
      });
      await tx.cVDocument.deleteMany({ where: { id: { not: cv.id } } });
      return { cv, previous };
    });

    await Promise.all(created.previous.map((item) => deleteStoredFile(item.filePath)));
    return toAdminCv(created.cv);
  } catch (error) {
    await deleteStoredFile(filePath);
    throw error;
  }
};

export const updateCv = async (id: number, data: { title: string; isPublic: boolean }) => {
  const cv = await prisma.cVDocument.update({ where: { id }, data });
  return toAdminCv(cv);
};

export const removeCv = async (id: number) => {
  const cv = await prisma.cVDocument.findUnique({ where: { id } });
  if (!cv) throw new AppError(404, 'NOT_FOUND', 'CV record not found');
  await prisma.cVDocument.delete({ where: { id } });
  await deleteStoredFile(cv.filePath);
};

export const getActiveCvFile = async (id?: number) => {
  const cv = id
    ? await prisma.cVDocument.findUnique({ where: { id } })
    : await prisma.cVDocument.findFirst({
        where: { isActive: true },
        orderBy: { uploadedAt: 'desc' },
      });
  if (!cv) throw new AppError(404, 'CV_NOT_FOUND', 'No CV has been uploaded');
  return cv;
};

export const getPublicCvFile = async () => {
  const cv = await prisma.cVDocument.findFirst({
    where: { isActive: true, isPublic: true },
    orderBy: { uploadedAt: 'desc' },
  });
  if (!cv) {
    throw new AppError(404, 'CV_NOT_AVAILABLE', 'No public CV is currently available');
  }
  return cv;
};

export const cvAbsolutePath = (filePath: string) => resolveStoredFile(filePath);

export const cvDownloadName = (title: string) => safeDownloadName(title, 'pdf');
