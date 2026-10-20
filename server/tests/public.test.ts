import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { createProfile, createProject, prisma, resetDatabase } from './helpers';

const app = createApp();

describe('Public API', () => {
  beforeEach(async () => {
    await resetDatabase();
    await createProfile();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('returns only published and visible content on the home endpoint', async () => {
    await createProject({ slug: 'published-project', title: 'Published Project' });
    await createProject({
      slug: 'draft-project',
      title: 'Draft Project',
      published: false,
      sortOrder: 2,
    });
    await prisma.skill.createMany({
      data: [
        { name: 'TypeScript', category: 'Languages', visible: true, sortOrder: 1 },
        { name: 'Hidden Skill', category: 'Languages', visible: false, sortOrder: 2 },
      ],
    });
    await prisma.socialLink.create({
      data: {
        platform: 'GitHub',
        label: 'GitHub',
        url: 'https://github.com/example',
        visible: true,
      },
    });
    await prisma.socialLink.create({
      data: {
        platform: 'LinkedIn',
        label: 'Hidden LinkedIn',
        url: 'https://linkedin.com/in/example',
        visible: false,
      },
    });

    const response = await request(app).get('/api/home');
    expect(response.status).toBe(200);
    expect(response.body.data.profile.fullName).toBe('Test Person');
    expect(response.body.data.projects).toHaveLength(1);
    expect(response.body.data.projects[0].slug).toBe('published-project');
    expect(response.body.data.skills.map((skill: { name: string }) => skill.name)).toEqual([
      'TypeScript',
    ]);
    expect(response.body.data.socialLinks).toHaveLength(1);
    expect(response.body.data.cv).toBeNull();
  });

  it('returns a published project by slug and hides drafts', async () => {
    await createProject({ slug: 'visible-case-study', title: 'Visible Case Study' });
    await createProject({
      slug: 'hidden-case-study',
      title: 'Hidden Case Study',
      published: false,
      sortOrder: 2,
    });

    const visible = await request(app).get('/api/projects/visible-case-study');
    expect(visible.status).toBe(200);
    expect(visible.body.data.title).toBe('Visible Case Study');
    expect(visible.body.data.technologies).toEqual(['TypeScript', 'React']);

    const hidden = await request(app).get('/api/projects/hidden-case-study');
    expect(hidden.status).toBe(404);
  });

  it('filters the project listing by search term and category', async () => {
    await createProject({
      slug: 'react-dashboard',
      title: 'React Dashboard',
      category: 'Web Applications',
    });
    await createProject({
      slug: 'sql-library',
      title: 'SQL Library',
      category: 'Database Systems',
      sortOrder: 2,
    });

    const search = await request(app).get('/api/projects?q=Dashboard');
    expect(search.status).toBe(200);
    expect(search.body.data.items).toHaveLength(1);
    expect(search.body.data.items[0].slug).toBe('react-dashboard');

    const category = await request(app).get('/api/projects?category=Database%20Systems');
    expect(category.status).toBe(200);
    expect(category.body.data.items).toHaveLength(1);
    expect(category.body.data.items[0].slug).toBe('sql-library');
  });

  it('stores valid contact messages and silently accepts honeypot submissions', async () => {
    const valid = await request(app).post('/api/contact').send({
      name: 'Recruiter Person',
      email: 'Recruiter@Example.com',
      subject: 'Internship opportunity',
      message: 'We would like to discuss an internship opportunity with you.',
      reason: 'Internship opportunity',
    });

    expect(valid.status).toBe(201);
    expect(valid.body.data.received).toBe(true);
    expect(valid.body.data.emailNotified).toBe(false);
    const stored = await prisma.contactMessage.findMany();
    expect(stored).toHaveLength(1);
    expect(stored[0].email).toBe('recruiter@example.com');

    const spam = await request(app).post('/api/contact').send({
      name: 'Spam Bot',
      email: 'spam@example.com',
      subject: 'Buy something',
      message: 'This submission should be discarded by the honeypot.',
      website: 'https://spam.example.com',
    });
    expect(spam.status).toBe(201);
    expect(await prisma.contactMessage.count()).toBe(1);
  });

  it('rejects invalid contact submissions with field errors', async () => {
    const response = await request(app).post('/api/contact').send({
      name: 'A',
      email: 'not-an-email',
      subject: 'Hi',
      message: 'Too short',
    });

    expect(response.status).toBe(422);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
    expect(response.body.error.details.email).toBeDefined();
    expect(response.body.error.details.message).toBeDefined();
    expect(await prisma.contactMessage.count()).toBe(0);
  });

  it('does not apply API CORS rules to static files', async () => {
    const response = await request(app).get('/robots.txt').set('Origin', 'http://127.0.0.1:4100');

    expect(response.status).toBe(200);
    expect(response.text).toContain('User-agent');
  });

  it('rejects state-changing requests from disallowed origins', async () => {
    const response = await request(app)
      .post('/api/contact')
      .set('Origin', 'https://malicious.example')
      .send({
        name: 'Origin Test',
        email: 'origin@example.com',
        subject: 'Origin check',
        message: 'This message should be blocked by the origin check.',
      });

    expect(response.status).toBe(403);
  });
});
