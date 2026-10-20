import type { Request, Response } from 'express';
import { prisma } from '../../config/prisma';
import { asyncHandler } from '../../utils/asyncHandler';
import { notFound } from '../../utils/errors';
import { stringifyStringList } from '../../utils/json';
import { nextSortOrder, reorderRecords } from '../../utils/reorder';
import { toAdminEducation } from '../../services/serializers';

const mapEducation = (body: any) => ({
  institution: body.institution,
  qualification: body.qualification,
  fieldOfStudy: body.fieldOfStudy,
  location: body.location,
  startDate: body.startDate,
  endDate: body.endDate,
  isCurrent: body.isCurrent,
  description: body.description,
  modules: stringifyStringList(body.modules),
  achievements: stringifyStringList(body.achievements),
  published: body.published,
});

export const listEducation = asyncHandler(async (_req: Request, res: Response) => {
  const education = await prisma.education.findMany({
    orderBy: [{ sortOrder: 'asc' }, { startDate: 'desc' }],
  });
  res.json({ success: true, data: education.map(toAdminEducation) });
});

export const createEducation = asyncHandler(async (req: Request, res: Response) => {
  const education = await prisma.education.create({
    data: {
      ...mapEducation(req.body),
      sortOrder: req.body.sortOrder ?? (await nextSortOrder('education')),
    },
  });
  res.status(201).json({ success: true, data: toAdminEducation(education) });
});

export const updateEducation = asyncHandler(async (req: Request, res: Response) => {
  const existing = await prisma.education.findUnique({ where: { id: Number(req.params.id) } });
  if (!existing) throw notFound('Education record not found');
  const education = await prisma.education.update({
    where: { id: existing.id },
    data: {
      ...mapEducation(req.body),
      ...(req.body.sortOrder !== undefined ? { sortOrder: req.body.sortOrder } : {}),
    },
  });
  res.json({ success: true, data: toAdminEducation(education) });
});

export const deleteEducation = asyncHandler(async (req: Request, res: Response) => {
  await prisma.education.delete({ where: { id: Number(req.params.id) } });
  res.json({ success: true, data: { message: 'Education record deleted' } });
});

export const reorderEducation = asyncHandler(async (req: Request, res: Response) => {
  await reorderRecords('education', req.body.ids);
  res.json({ success: true, data: { message: 'Education order updated' } });
});
