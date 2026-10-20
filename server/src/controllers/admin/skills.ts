import type { Request, Response } from 'express';
import { prisma } from '../../config/prisma';
import { asyncHandler } from '../../utils/asyncHandler';
import { notFound } from '../../utils/errors';
import { nextSortOrder, reorderRecords } from '../../utils/reorder';

export const listSkills = asyncHandler(async (_req: Request, res: Response) => {
  const skills = await prisma.skill.findMany({
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
  });
  res.json({ success: true, data: skills });
});

export const createSkill = asyncHandler(async (req: Request, res: Response) => {
  const skill = await prisma.skill.create({
    data: { ...req.body, sortOrder: req.body.sortOrder ?? (await nextSortOrder('skill')) },
  });
  res.status(201).json({ success: true, data: skill });
});

export const updateSkill = asyncHandler(async (req: Request, res: Response) => {
  const existing = await prisma.skill.findUnique({ where: { id: Number(req.params.id) } });
  if (!existing) throw notFound('Skill not found');
  const skill = await prisma.skill.update({
    where: { id: existing.id },
    data: req.body,
  });
  res.json({ success: true, data: skill });
});

export const deleteSkill = asyncHandler(async (req: Request, res: Response) => {
  await prisma.skill.delete({ where: { id: Number(req.params.id) } });
  res.json({ success: true, data: { message: 'Skill deleted' } });
});

export const reorderSkills = asyncHandler(async (req: Request, res: Response) => {
  await reorderRecords('skill', req.body.ids);
  res.json({ success: true, data: { message: 'Skill order updated' } });
});
