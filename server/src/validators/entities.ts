import { z } from 'zod';
import {
  CONTACT_REASONS,
  EXPERIENCE_TYPES,
  PROJECT_CATEGORIES,
  PROJECT_STATUSES,
  SOCIAL_PLATFORMS,
} from '../config/constants';
import {
  booleanField,
  optionalDate,
  optionalEmail,
  optionalText,
  optionalUrl,
  requiredDate,
  slugInput,
  stringList,
} from './common';

const sortOrder = z.coerce.number().int().min(0).max(9999).optional();

export const profileSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  professionalTitle: z.string().trim().min(2).max(180),
  headline: z.string().trim().min(2).max(220),
  heroIntro: z.string().trim().min(20).max(2000),
  heroTechSummary: stringList,
  biography: z.string().trim().min(20).max(8000),
  academicBackground: optionalText(4000),
  approach: optionalText(4000),
  careerObjectives: optionalText(4000),
  professionalInterests: stringList,
  location: optionalText(120),
  contactEmail: optionalEmail,
});

export const projectSchema = z
  .object({
    title: z.string().trim().min(2).max(180),
    slug: slugInput,
    shortDescription: z.string().trim().min(10).max(400),
    fullDescription: z.string().trim().min(20).max(20000),
    category: z.enum(PROJECT_CATEGORIES),
    projectStatus: z.enum(PROJECT_STATUSES),
    contribution: optionalText(6000),
    keyFeatures: stringList,
    challenges: optionalText(6000),
    solutions: optionalText(6000),
    technologies: stringList,
    repositoryUrl: optionalUrl,
    liveUrl: optionalUrl,
    startDate: optionalDate,
    endDate: optionalDate,
    featured: booleanField.optional().default(false),
    published: booleanField.optional().default(false),
    sortOrder,
  })
  .superRefine((value, ctx) => {
    if (value.startDate && value.endDate && value.endDate < value.startDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['endDate'],
        message: 'End date cannot be before the start date',
      });
    }
  });

export const projectImageUpdateSchema = z.object({
  altText: optionalText(255),
  sortOrder,
});

export const skillSchema = z.object({
  name: z.string().trim().min(1).max(120),
  category: z.string().trim().min(1).max(100),
  description: optionalText(1000),
  proficiencyLabel: optionalText(80),
  context: optionalText(255),
  visible: booleanField.optional().default(true),
  sortOrder,
});

export const experienceSchema = z
  .object({
    organization: z.string().trim().min(2).max(180),
    position: z.string().trim().min(2).max(180),
    type: z.enum(EXPERIENCE_TYPES),
    location: optionalText(120),
    startDate: requiredDate,
    endDate: optionalDate,
    isCurrent: booleanField.optional().default(false),
    responsibilities: stringList,
    achievements: stringList,
    technologies: stringList,
    evidenceUrl: optionalUrl,
    published: booleanField.optional().default(true),
    sortOrder,
  })
  .superRefine((value, ctx) => {
    if (!value.isCurrent && !value.endDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['endDate'],
        message: 'Provide an end date or mark this role as current',
      });
    }
    if (value.endDate && value.endDate < value.startDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['endDate'],
        message: 'End date cannot be before the start date',
      });
    }
  });

export const educationSchema = z
  .object({
    institution: z.string().trim().min(2).max(180),
    qualification: z.string().trim().min(2).max(220),
    fieldOfStudy: optionalText(180),
    location: optionalText(120),
    startDate: optionalDate,
    endDate: optionalDate,
    isCurrent: booleanField.optional().default(true),
    description: optionalText(4000),
    modules: stringList,
    achievements: stringList,
    published: booleanField.optional().default(true),
    sortOrder,
  })
  .superRefine((value, ctx) => {
    if (value.startDate && value.endDate && value.endDate < value.startDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['endDate'],
        message: 'End date cannot be before the start date',
      });
    }
  });

export const certificationSchema = z.object({
  title: z.string().trim().min(2).max(220),
  provider: z.string().trim().min(2).max(180),
  completionDate: optionalDate,
  description: optionalText(4000),
  credentialId: optionalText(180),
  verificationUrl: optionalUrl,
  published: booleanField.optional().default(false),
  sortOrder,
});

export const socialLinkSchema = z.object({
  platform: z.enum(SOCIAL_PLATFORMS),
  label: z.string().trim().min(1).max(120),
  url: z
    .string()
    .trim()
    .min(1)
    .max(500)
    .regex(/^https?:\/\/[^\s]+$/i, 'Enter a full http(s) URL'),
  icon: optionalText(60),
  visible: booleanField.optional().default(true),
  sortOrder,
});

export const settingsSchema = z.object({
  websiteTitle: z.string().trim().min(2).max(180),
  websiteDescription: z.string().trim().min(10).max(500),
  footerTagline: optionalText(300),
  contactNotificationEmail: optionalEmail,
  siteUrl: optionalUrl,
});

export const contactSchema = z.object({
  name: z.string().trim().min(2, 'Enter your name').max(120),
  email: z.string().trim().email('Enter a valid email address').max(191),
  subject: z.string().trim().min(3, 'Enter a subject').max(180),
  message: z
    .string()
    .trim()
    .min(10, 'Your message should be at least 10 characters')
    .max(5000, 'Your message is too long'),
  reason: z.enum(CONTACT_REASONS).optional(),
  website: z.string().max(200).optional(),
});

export const loginSchema = z.object({
  email: z.string().trim().email('Enter a valid email address').max(191),
  password: z.string().min(1, 'Enter your password').max(200),
});

export const cvUpdateSchema = z.object({
  title: z.string().trim().min(2).max(180),
  isPublic: booleanField,
});

export const cvUploadSchema = z.object({
  title: z.string().trim().min(2).max(180),
  isPublic: booleanField.optional().default(false),
});

export const testEmailSchema = z.object({
  recipient: z.string().trim().email().optional(),
});
