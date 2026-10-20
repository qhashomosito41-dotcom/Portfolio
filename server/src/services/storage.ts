import { randomBytes } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { env } from '../config/env';
import { AppError } from '../utils/errors';

export const STORAGE_FOLDERS = {
  profiles: 'profiles',
  projects: 'projects',
  certifications: 'certifications',
  cv: 'cv',
} as const;

export type StorageFolder = (typeof STORAGE_FOLDERS)[keyof typeof STORAGE_FOLDERS];

export type DetectedFile = { extension: string; mimeType: string };

export const detectImage = (buffer: Buffer): DetectedFile | null => {
  if (buffer.length < 12) return null;

  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { extension: 'jpg', mimeType: 'image/jpeg' };
  }
  if (buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return { extension: 'png', mimeType: 'image/png' };
  }
  if (
    buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
    buffer.subarray(8, 12).toString('ascii') === 'WEBP'
  ) {
    return { extension: 'webp', mimeType: 'image/webp' };
  }
  const gifHeader = buffer.subarray(0, 6).toString('ascii');
  if (gifHeader === 'GIF87a' || gifHeader === 'GIF89a') {
    return { extension: 'gif', mimeType: 'image/gif' };
  }
  return null;
};

export const detectPdf = (buffer: Buffer): DetectedFile | null => {
  if (buffer.subarray(0, 5).toString('ascii') === '%PDF-') {
    return { extension: 'pdf', mimeType: 'application/pdf' };
  }
  return null;
};

export const ensureStorage = async () => {
  for (const folder of Object.values(STORAGE_FOLDERS)) {
    await mkdir(path.join(env.storageDir, folder), { recursive: true });
  }
};

export const saveBuffer = async (
  buffer: Buffer,
  folder: StorageFolder,
  detected: DetectedFile,
): Promise<string> => {
  await ensureStorage();
  const filename = `${Date.now()}-${randomBytes(10).toString('hex')}.${detected.extension}`;
  const absolutePath = path.join(env.storageDir, folder, filename);
  await writeFile(absolutePath, buffer, { flag: 'wx', mode: 0o640 });
  return `${folder}/${filename}`;
};

export const resolveStoredFile = (relativePath: string): string => {
  if (
    !relativePath ||
    path.isAbsolute(relativePath) ||
    relativePath.includes('\0') ||
    relativePath.includes('..')
  ) {
    throw new AppError(400, 'INVALID_PATH', 'Invalid stored file reference');
  }
  const normalized = relativePath.replace(/\\/g, '/');
  const absolutePath = path.resolve(env.storageDir, normalized);
  const root = path.resolve(env.storageDir);
  if (absolutePath !== root && !absolutePath.startsWith(`${root}${path.sep}`)) {
    throw new AppError(400, 'INVALID_PATH', 'Invalid stored file reference');
  }
  if (!existsSync(absolutePath)) {
    throw new AppError(404, 'FILE_NOT_FOUND', 'The stored file could not be found');
  }
  return absolutePath;
};

export const deleteStoredFile = async (relativePath: string | null | undefined) => {
  if (!relativePath) return;
  try {
    const absolutePath = resolveStoredFile(relativePath);
    await unlink(absolutePath);
  } catch {
    return;
  }
};

export const safeDownloadName = (title: string, extension: string): string => {
  const base = title
    .replace(/[^a-zA-Z0-9-_ ]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 80);
  return `${base || 'document'}.${extension}`;
};
