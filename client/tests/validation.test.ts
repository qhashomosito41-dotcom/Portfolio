import { describe, expect, it } from 'vitest';
import { contactFormSchema } from '../src/utils/validation';
import {
  projectFormSchema,
  skillFormSchema,
  socialLinkFormSchema,
} from '../src/utils/adminSchemas';

describe('Form validation', () => {
  it('accepts a valid contact request', () => {
    const result = contactFormSchema.safeParse({
      name: 'Mosito Qhasho',
      email: 'hello@example.com',
      subject: 'Internship enquiry',
      message: 'I would like to learn more about the internship opportunity.',
      reason: 'Internship opportunity',
      website: '',
    });
    expect(result.success).toBe(true);
  });

  it('reports invalid contact fields', () => {
    const result = contactFormSchema.safeParse({
      name: 'M',
      email: 'invalid',
      subject: 'Hi',
      message: 'Short',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const fields = result.error.issues.map((issue) => issue.path[0]);
      expect(fields).toEqual(expect.arrayContaining(['name', 'email', 'subject', 'message']));
    }
  });

  it('rejects a project with an end date before its start date', () => {
    const result = projectFormSchema.safeParse({
      title: 'Valid Project',
      slug: 'valid-project',
      shortDescription: 'A valid short description for the project.',
      fullDescription: 'A sufficiently long project overview for form validation testing.',
      category: 'Web Applications',
      projectStatus: 'Completed',
      contribution: '',
      keyFeaturesText: '',
      challenges: '',
      solutions: '',
      technologiesText: 'TypeScript, React',
      repositoryUrl: '',
      liveUrl: '',
      startDate: '2026-05-01',
      endDate: '2026-04-01',
      featured: false,
      published: true,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path[0] === 'endDate')).toBe(true);
    }
  });

  it('requires a full http(s) URL for social links', () => {
    const result = socialLinkFormSchema.safeParse({
      platform: 'GitHub',
      label: 'GitHub',
      url: 'github.com/example',
      icon: '',
      visible: true,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('http');
    }
  });

  it('requires a skill name and category', () => {
    const result = skillFormSchema.safeParse({
      name: '',
      category: '',
      description: '',
      proficiencyLabel: '',
      context: '',
      visible: true,
    });
    expect(result.success).toBe(false);
  });
});
