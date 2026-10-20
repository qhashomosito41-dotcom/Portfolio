import { z } from 'zod';

export const CONTACT_REASONS = [
  'Job opportunity',
  'Internship opportunity',
  'Freelance project',
  'Collaboration',
  'General enquiry',
] as const;

export const contactFormSchema = z.object({
  name: z.string().trim().min(2, 'Enter your name').max(120, 'Your name is too long'),
  email: z.string().trim().email('Enter a valid email address'),
  subject: z.string().trim().min(3, 'Enter a subject').max(180, 'Your subject is too long'),
  message: z
    .string()
    .trim()
    .min(10, 'Your message should be at least 10 characters')
    .max(5000, 'Your message is too long'),
  reason: z.enum(CONTACT_REASONS).optional().or(z.literal('')),
  website: z.string().max(0).optional(),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;
