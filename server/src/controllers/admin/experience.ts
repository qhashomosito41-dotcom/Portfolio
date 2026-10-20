import type { Request, Response } from 'express';
import { prisma } from '../../config/prisma';
import { asyncHandler } from '../../utils/asyncHandler';
import { notFound } from '../../utils/errors';
import { stringifyStringList } from '../../utils/json';
import { nextSortOrder, reorderRecords } from '../../utils/reorder';
import { toAdminExperience } from '../../services/serializers';

const mapExperience = (body: any) => ({
  organization: body.organization,
  position: body.position,
  type: body.type,
  location: body.location,
  startDate: body.startDate,
  endDate: body.endDate,
  isCurrent: body.isCurrent,
  responsibilities: stringifyStringList(body.responsibilities),
  achievements: stringifyStringList(body.achievements),
  technologies: stringifyStringList(body.technologies),
  evidenceUrl: body.evidenceUrl,
  published: body.published,
});

export const listExperience = asyncHandler(async (_req: Request, res: Response) => {
  const experience = await prisma.experience.findMany({
    orderBy: [{ sortOrder: 'asc' }, { startDate: 'desc' }],
  });
  res.json({ success: true, data: experience.map(toAdminExperience) });
});

export const createExperience = asyncHandler(async (req: Request, res: Response) => {
  const experience = await prisma.experience.create({
    data: {
      ...mapExperience(req.body),
      sortOrder: req.body.sortOrder ?? (await nextSortOrder('experience')),
    },
  });
  res.status(201).json({ success: true, data: toAdminExperience(experience) });
});

export const updateExperience = asyncHandler(async (req: Request, res: Response) => {
  const existing = await prisma.experience.findUnique({ where: { id: Number(req.params.id) } });
  if (!existing) throw notFound('Experience record not found');
  const experience = await prisma.experience.update({
    where: { id: existing.id },
    data: {
      ...mapExperience(req.body),
      ...(req.body.sortOrder !== undefined ? { sortOrder: req.body.sortOrder } : {}),
    },
  });
  res.json({ success: true, data: toAdminExperience(experience) });
});

export const deleteExperience = asyncHandler(async (req: Request, res: Response) => {
  await prisma.experience.delete({ where: { id: Number(req.params.id) } });
  res.json({ success: true, data: { message: 'Experience deleted' } });
});

export const reorderExperience = asyncHandler(async (req: Request, res: Response) => {
  await reorderRecords('experience', req.body.ids);
  res.json({ success: true, data: { message: 'Experience order updated' } });
});
