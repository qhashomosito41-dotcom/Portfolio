import { z } from 'zod';

export const idParam = z.object({
  id: z.coerce.number().int().positive('A valid numeric identifier is required'),
});

export const booleanField = z.preprocess(
  (value) => value === true || value === 'true' || value === 1 || value === '1',
  z.boolean(),
);

const optionalDateValue = z.union([z.string(), z.null(), z.undefined()]);

export const optionalDate = optionalDateValue.transform((value, ctx) => {
  if (!value) return null;
  const date = new Date(value.length === 10 ? `${value}T00:00:00.000Z` : value);
  if (Number.isNaN(date.getTime())) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Enter a valid date' });
    return z.NEVER;
  }
  return date;
});

export const requiredDate = z
  .string()
  .min(1, 'Date is required')
  .transform((value, ctx) => {
    const date = new Date(value.length === 10 ? `${value}T00:00:00.000Z` : value);
    if (Number.isNaN(date.getTime())) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Enter a valid date' });
      return z.NEVER;
    }
    return date;
  });

const optionalUrlValue = z.union([z.string(), z.null(), z.undefined()]);

export const optionalUrl = optionalUrlValue.transform((value, ctx) => {
  const trimmed = (value ?? '').trim();
  if (!trimmed) return null;
  if (trimmed.length > 500) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'URL is too long' });
    return z.NEVER;
  }
  if (!/^https?:\/\/[^\s]+$/i.test(trimmed)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Enter a full http(s) URL' });
    return z.NEVER;
  }
  return trimmed;
});

export const optionalEmail = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((value, ctx) => {
    const trimmed = (value ?? '').trim();
    if (!trimmed) return null;
    const parsed = z.string().email().safeParse(trimmed);
    if (!parsed.success) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Enter a valid email address' });
      return z.NEVER;
    }
    return trimmed.toLowerCase();
  });

export const stringList = z.array(z.string().trim().min(1).max(200)).max(50).optional().default([]);

export const optionalText = (max: number) =>
  z
    .union([z.string(), z.null(), z.undefined()])
    .transform((value) => (value ?? '').trim() || null)
    .refine((value) => value === null || value.length <= max, `Must be ${max} characters or fewer`);

export const slugInput = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((value) => (value ?? '').trim().toLowerCase())
  .refine(
    (value) => value === '' || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value),
    'Use lowercase letters, numbers, and hyphens only',
  );

export const reorderSchema = z.object({
  ids: z.array(z.coerce.number().int().positive()).min(1).max(500),
});

export const paginationQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const adminProjectListQuery = paginationQuery.extend({
  q: z.string().trim().max(200).optional(),
  state: z.enum(['all', 'published', 'draft', 'featured']).default('all'),
});

export const adminMessageListQuery = paginationQuery.extend({
  q: z.string().trim().max(200).optional(),
  status: z.enum(['all', 'unread', 'read', 'archived']).default('all'),
});

export const messageUpdateSchema = z
  .object({
    isRead: z.boolean().optional(),
    isArchived: z.boolean().optional(),
  })
  .refine((value) => value.isRead !== undefined || value.isArchived !== undefined, {
    message: 'Provide at least one field to update',
  });
