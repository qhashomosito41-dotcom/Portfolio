import type { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/prisma';
import { asyncHandler } from '../../utils/asyncHandler';
import { notFound } from '../../utils/errors';
import { adminMessageListQuery } from '../../validators/common';
import { toAdminMessage } from '../../services/serializers';

export const listMessages = asyncHandler(async (req: Request, res: Response) => {
  const query = req.validatedQuery as z.infer<typeof adminMessageListQuery>;
  const where = {
    ...(query.status === 'archived'
      ? { isArchived: true }
      : {
          isArchived: false,
          ...(query.status !== 'all' ? { isRead: query.status === 'read' } : {}),
        }),
    ...(query.q
      ? {
          OR: [
            { name: { contains: query.q } },
            { email: { contains: query.q } },
            { subject: { contains: query.q } },
            { message: { contains: query.q } },
          ],
        }
      : {}),
  };

  const [items, total, unread, inbox, archived] = await Promise.all([
    prisma.contactMessage.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    }),
    prisma.contactMessage.count({ where }),
    prisma.contactMessage.count({ where: { isRead: false, isArchived: false } }),
    prisma.contactMessage.count({ where: { isArchived: false } }),
    prisma.contactMessage.count({ where: { isArchived: true } }),
  ]);

  res.json({
    success: true,
    data: {
      items: items.map(toAdminMessage),
      pagination: {
        page: query.page,
        pageSize: query.pageSize,
        total,
        totalPages: Math.ceil(total / query.pageSize),
      },
      counts: { unread, inbox, archived },
    },
  });
});

export const getMessage = asyncHandler(async (req: Request, res: Response) => {
  const message = await prisma.contactMessage.findUnique({
    where: { id: Number(req.params.id) },
  });
  if (!message) throw notFound('Message not found');
  res.json({ success: true, data: toAdminMessage(message) });
});

export const updateMessage = asyncHandler(async (req: Request, res: Response) => {
  const message = await prisma.contactMessage.update({
    where: { id: Number(req.params.id) },
    data: req.body,
  });
  res.json({ success: true, data: toAdminMessage(message) });
});

export const deleteMessage = asyncHandler(async (req: Request, res: Response) => {
  await prisma.contactMessage.delete({ where: { id: Number(req.params.id) } });
  res.json({ success: true, data: { message: 'Message deleted' } });
});
