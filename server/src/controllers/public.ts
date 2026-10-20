import type { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma';
import { asyncHandler } from '../utils/asyncHandler';
import { notFound } from '../utils/errors';
import { paginationQuery } from '../validators/common';
import {
  getPublicCv,
  getPublicProject,
  getPublicProfile,
  getPublicHome,
  listPublishedProjects,
} from '../services/content';
import { getPublicCvFile, cvAbsolutePath, cvDownloadName } from '../services/cv';
import {
  toPublicCertification,
  toPublicEducation,
  toPublicExperience,
  toPublicSkill,
  toPublicSocialLink,
} from '../services/serializers';
import { resolveStoredFile } from '../services/storage';
import { publicSettings } from '../services/settings';

export const projectQuery = paginationQuery.extend({
  category: z.string().trim().max(80).optional(),
  q: z.string().trim().max(200).optional(),
});

export const getHome = asyncHandler(async (_req: Request, res: Response) => {
  const data = await getPublicHome();
  res.json({ success: true, data });
});

export const getProfile = asyncHandler(async (_req: Request, res: Response) => {
  const profile = await getPublicProfile();
  if (!profile) throw notFound('Profile not found');
  res.json({ success: true, data: profile });
});

export const listProjects = asyncHandler(async (req: Request, res: Response) => {
  const query = req.validatedQuery as z.infer<typeof projectQuery>;
  const data = await listPublishedProjects(query);
  res.json({ success: true, data });
});

export const getProject = asyncHandler(async (req: Request, res: Response) => {
  const data = await getPublicProject(req.params.slug);
  res.json({ success: true, data });
});

export const listSkills = asyncHandler(async (_req: Request, res: Response) => {
  const skills = await prisma.skill.findMany({
    where: { visible: true },
    orderBy: [{ sortOrder: 'asc' }, { category: 'asc' }],
  });
  res.json({ success: true, data: skills.map(toPublicSkill) });
});

export const listExperience = asyncHandler(async (_req: Request, res: Response) => {
  const experience = await prisma.experience.findMany({
    where: { published: true },
    orderBy: [{ sortOrder: 'asc' }, { startDate: 'desc' }],
  });
  res.json({ success: true, data: experience.map(toPublicExperience) });
});

export const listEducation = asyncHandler(async (_req: Request, res: Response) => {
  const education = await prisma.education.findMany({
    where: { published: true },
    orderBy: [{ sortOrder: 'asc' }, { startDate: 'desc' }],
  });
  res.json({ success: true, data: education.map(toPublicEducation) });
});

export const listCertifications = asyncHandler(async (_req: Request, res: Response) => {
  const certifications = await prisma.certification.findMany({
    where: { published: true },
    orderBy: [{ sortOrder: 'asc' }, { completionDate: 'desc' }],
  });
  res.json({ success: true, data: certifications.map(toPublicCertification) });
});

export const listSocialLinks = asyncHandler(async (_req: Request, res: Response) => {
  const links = await prisma.socialLink.findMany({
    where: { visible: true },
    orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
  });
  res.json({ success: true, data: links.map(toPublicSocialLink) });
});

export const getCvMetadata = asyncHandler(async (_req: Request, res: Response) => {
  const cv = await getPublicCv();
  res.json({ success: true, data: cv });
});

export const downloadCv = asyncHandler(async (_req: Request, res: Response) => {
  const cv = await getPublicCvFile();
  const absolutePath = cvAbsolutePath(cv.filePath);
  res.download(absolutePath, cvDownloadName(cv.title), (error) => {
    if (error && !res.headersSent) {
      res.status(404).json({
        success: false,
        error: { code: 'CV_NOT_FOUND', message: 'The CV file could not be read' },
      });
    }
  });
});

export const getCertificate = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const certification = await prisma.certification.findFirst({
    where: { id, published: true },
  });
  if (!certification?.certificatePath) throw notFound('Certificate not found');

  const absolutePath = resolveStoredFile(certification.certificatePath);
  const isPdf = certification.certificatePath.toLowerCase().endsWith('.pdf');
  res.setHeader('Content-Disposition', 'inline');
  res.setHeader('Cache-Control', 'private, max-age=3600');
  if (isPdf) res.type('application/pdf');
  res.sendFile(absolutePath);
});

export const getPublicSiteSettings = asyncHandler(async (_req: Request, res: Response) => {
  const settings = await publicSettings();
  res.json({ success: true, data: settings });
});
