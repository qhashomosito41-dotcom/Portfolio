export const PROJECT_CATEGORIES = [
  'Web Applications',
  'Software Development',
  'Database Systems',
  'E-commerce',
  'Academic Projects',
  'Other',
] as const;

export const PROJECT_STATUSES = ['Completed', 'In Progress', 'Planned', 'Archived'] as const;

export const EXPERIENCE_TYPES = [
  'Internship',
  'Full-time',
  'Part-time',
  'Contract',
  'Freelance',
  'Volunteer',
  'Academic',
] as const;

export const CONTACT_REASONS = [
  'Job opportunity',
  'Internship opportunity',
  'Freelance project',
  'Collaboration',
  'General enquiry',
] as const;

export const SOCIAL_PLATFORMS = [
  'GitHub',
  'LinkedIn',
  'X',
  'Instagram',
  'Facebook',
  'YouTube',
  'Behance',
  'Dribbble',
  'Website',
  'Other',
] as const;

export const SKILL_CATEGORY_SUGGESTIONS = [
  'Programming Languages',
  'Web Development',
  'Databases',
  'Tools & Platforms',
  'Additional Areas',
] as const;

export const MAX_UPLOAD_BYTES = {
  image: 8 * 1024 * 1024,
  cv: 10 * 1024 * 1024,
} as const;
