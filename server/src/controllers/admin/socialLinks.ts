import type { Request, Response } from 'express';
import { prisma } from '../../config/prisma';
import { asyncHandler } from '../../utils/asyncHandler';
import { notFound } from '../../utils/errors';
import { nextSortOrder, reorderRecords } from '../../utils/reorder';

export const listSocialLinks = asyncHandler(async (_req: Request, res: Response) => {
  const links = await prisma.socialLink.findMany({
    orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
  });
  res.json({ success: true, data: links });
});

export const createSocialLink = asyncHandler(async (req: Request, res: Response) => {
  const link = await prisma.socialLink.create({
    data: { ...req.body, sortOrder: req.body.sortOrder ?? (await nextSortOrder('socialLink')) },
  });
  res.status(201).json({ success: true, data: link });
});

export const updateSocialLink = asyncHandler(async (req: Request, res: Response) => {
  const existing = await prisma.socialLink.findUnique({ where: { id: Number(req.params.id) } });
  if (!existing) throw notFound('Social link not found');
  const link = await prisma.socialLink.update({
    where: { id: existing.id },
    data: req.body,
  });
  res.json({ success: true, data: link });
});

export const deleteSocialLink = asyncHandler(async (req: Request, res: Response) => {
  await prisma.socialLink.delete({ where: { id: Number(req.params.id) } });
  res.json({ success: true, data: { message: 'Social link deleted' } });
});

export const reorderSocialLinks = asyncHandler(async (req: Request, res: Response) => {
  await reorderRecords('socialLink', req.body.ids);
  res.json({ success: true, data: { message: 'Social link order updated' } });
});
