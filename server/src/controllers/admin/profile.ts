import type { Request, Response } from 'express';
import { prisma } from '../../config/prisma';
import { asyncHandler } from '../../utils/asyncHandler';
import { AppError, notFound } from '../../utils/errors';
import { stringifyStringList } from '../../utils/json';
import { toAdminProfile } from '../../services/serializers';
import { deleteStoredFile, detectImage, saveBuffer } from '../../services/storage';

export const getProfile = asyncHandler(async (_req: Request, res: Response) => {
  const profile = await prisma.profile.findUnique({ where: { id: 1 } });
  if (!profile) throw notFound('Profile has not been initialised. Run the database seed.');
  res.json({ success: true, data: toAdminProfile(profile) });
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body;
  const data = {
    fullName: body.fullName,
    professionalTitle: body.professionalTitle,
    headline: body.headline,
    heroIntro: body.heroIntro,
    heroTechSummary: stringifyStringList(body.heroTechSummary),
    biography: body.biography,
    academicBackground: body.academicBackground,
    approach: body.approach,
    careerObjectives: body.careerObjectives,
    professionalInterests: stringifyStringList(body.professionalInterests),
    location: body.location,
    contactEmail: body.contactEmail,
  };

  const existing = await prisma.profile.findUnique({ where: { id: 1 } });
  const profile = existing
    ? await prisma.profile.update({ where: { id: 1 }, data })
    : await prisma.profile.create({
        data: {
          id: 1,
          ...data,
          websiteTitle: 'Mosito | Web Design, Development & SEO',
          websiteDescription: body.biography.slice(0, 200),
        },
      });

  res.json({ success: true, data: toAdminProfile(profile) });
});

export const uploadProfileImage = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) throw new AppError(422, 'FILE_REQUIRED', 'Select an image to upload');
  const profile = await prisma.profile.findUnique({ where: { id: 1 } });
  if (!profile) throw notFound('Save the profile before uploading an image');

  const detected = detectImage(req.file.buffer);
  if (!detected) {
    throw new AppError(422, 'INVALID_FILE_TYPE', 'Upload a PNG, JPEG, WebP, or GIF image');
  }

  const filePath = await saveBuffer(req.file.buffer, 'profiles', detected);
  try {
    const updated = await prisma.profile.update({
      where: { id: 1 },
      data: { profileImagePath: filePath },
    });
    await deleteStoredFile(profile.profileImagePath);
    res.json({ success: true, data: toAdminProfile(updated) });
  } catch (error) {
    await deleteStoredFile(filePath);
    throw error;
  }
});

export const removeProfileImage = asyncHandler(async (_req: Request, res: Response) => {
  const profile = await prisma.profile.findUnique({ where: { id: 1 } });
  if (!profile) throw notFound('Profile not found');
  const oldPath = profile.profileImagePath;
  const updated = await prisma.profile.update({
    where: { id: 1 },
    data: { profileImagePath: null },
  });
  await deleteStoredFile(oldPath);
  res.json({ success: true, data: toAdminProfile(updated) });
});
