import { z } from 'zod';
import {
  EXPERIENCE_TYPES,
  PROJECT_CATEGORIES,
  PROJECT_STATUSES,
  SOCIAL_PLATFORMS,
} from './constants';

const optionalUrl = z
  .string()
  .trim()
  .max(500, 'URL is too long')
  .refine((value) => value === '' || /^https?:\/\/[^\s]+$/i.test(value), 'Enter a full http(s) URL');

const optionalEmail = z
  .string()
  .trim()
  .max(191, 'Email address is too long')
  .refine(
    (value) => value === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    'Enter a valid email address',
  );

export const profileFormSchema = z.object({
  fullName: z.string().trim().min(2, 'Enter your full name').max(120),
  professionalTitle: z.string().trim().min(2, 'Enter your professional title').max(180),
  headline: z.string().trim().min(2, 'Enter a headline').max(220),
  heroIntro: z
    .string()
    .trim()
    .min(20, 'The introduction should be at least 20 characters')
    .max(2000),
  heroTechSummary: z.string().max(4000, 'Keep this summary shorter'),
  biography: z
    .string()
    .trim()
    .min(20, 'The biography should be at least 20 characters')
    .max(8000),
  academicBackground: z.string().max(4000),
  approach: z.string().max(4000),
  careerObjectives: z.string().max(4000),
  professionalInterests: z.string().max(5000),
  location: z.string().max(120),
  contactEmail: optionalEmail,
});
export type ProfileFormValues = z.infer<typeof profileFormSchema>;

export const projectFormSchema = z
  .object({
    title: z.string().trim().min(2, 'Enter a project title').max(180),
    slug: z
      .string()
      .trim()
      .toLowerCase()
      .max(180)
      .refine(
        (value) => value === '' || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value),
        'Use lowercase letters, numbers and hyphens only',
      ),
    shortDescription: z
      .string()
      .trim()
      .min(10, 'Write a short description of at least 10 characters')
      .max(400),
    fullDescription: z
      .string()
      .trim()
      .min(20, 'Write an overview of at least 20 characters')
      .max(20000),
    category: z.enum(PROJECT_CATEGORIES),
    projectStatus: z.enum(PROJECT_STATUSES),
    contribution: z.string().max(6000),
    keyFeaturesText: z.string().max(12000),
    challenges: z.string().max(6000),
    solutions: z.string().max(6000),
    technologiesText: z.string().max(6000),
    repositoryUrl: optionalUrl,
    liveUrl: optionalUrl,
    startDate: z.string(),
    endDate: z.string(),
    featured: z.boolean(),
    published: z.boolean(),
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
export type ProjectFormValues = z.infer<typeof projectFormSchema>;

export const skillFormSchema = z.object({
  name: z.string().trim().min(1, 'Enter a skill name').max(120),
  category: z.string().trim().min(1, 'Enter a category').max(100),
  description: z.string().max(1000),
  proficiencyLabel: z.string().max(80),
  context: z.string().max(255),
  visible: z.boolean(),
});
export type SkillFormValues = z.infer<typeof skillFormSchema>;

export const experienceFormSchema = z
  .object({
    organization: z.string().trim().min(2, 'Enter the organisation').max(180),
    position: z.string().trim().min(2, 'Enter the position').max(180),
    type: z.enum(EXPERIENCE_TYPES),
    location: z.string().max(120),
    startDate: z.string().min(1, 'A start date is required'),
    endDate: z.string(),
    isCurrent: z.boolean(),
    responsibilitiesText: z.string().max(8000),
    achievementsText: z.string().max(8000),
    technologiesText: z.string().max(4000),
    evidenceUrl: optionalUrl,
    published: z.boolean(),
  })
  .superRefine((value, ctx) => {
    if (!value.isCurrent && !value.endDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['endDate'],
        message: 'Provide an end date or mark this role as current',
      });
    }
    if (value.endDate && value.startDate && value.endDate < value.startDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['endDate'],
        message: 'End date cannot be before the start date',
      });
    }
  });
export type ExperienceFormValues = z.infer<typeof experienceFormSchema>;

export const educationFormSchema = z
  .object({
    institution: z.string().trim().min(2, 'Enter the institution').max(180),
    qualification: z.string().trim().min(2, 'Enter the qualification').max(220),
    fieldOfStudy: z.string().max(180),
    location: z.string().max(120),
    startDate: z.string(),
    endDate: z.string(),
    isCurrent: z.boolean(),
    description: z.string().max(4000),
    modulesText: z.string().max(8000),
    achievementsText: z.string().max(8000),
    published: z.boolean(),
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
export type EducationFormValues = z.infer<typeof educationFormSchema>;

export const certificationFormSchema = z.object({
  title: z.string().trim().min(2, 'Enter the certification title').max(220),
  provider: z.string().trim().min(2, 'Enter the provider').max(180),
  completionDate: z.string(),
  description: z.string().max(4000),
  credentialId: z.string().max(180),
  verificationUrl: optionalUrl,
  published: z.boolean(),
});
export type CertificationFormValues = z.infer<typeof certificationFormSchema>;

export const socialLinkFormSchema = z.object({
  platform: z.enum(SOCIAL_PLATFORMS),
  label: z.string().trim().min(1, 'Enter a label').max(120),
  url: z
    .string()
    .trim()
    .min(1, 'Enter a URL')
    .max(500)
    .regex(/^https?:\/\/[^\s]+$/i, 'Enter a full http(s) URL'),
  icon: z.string().max(60),
  visible: z.boolean(),
});
export type SocialLinkFormValues = z.infer<typeof socialLinkFormSchema>;

export const settingsFormSchema = z.object({
  websiteTitle: z.string().trim().min(2, 'Enter the website title').max(180),
  websiteDescription: z
    .string()
    .trim()
    .min(10, 'The description should be at least 10 characters')
    .max(500),
  footerTagline: z.string().max(300),
  contactNotificationEmail: optionalEmail,
  siteUrl: optionalUrl,
});
export type SettingsFormValues = z.infer<typeof settingsFormSchema>;
