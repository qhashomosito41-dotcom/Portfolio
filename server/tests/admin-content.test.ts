import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { createAdmin, createProfile, login, prisma, resetDatabase } from './helpers';

const app = createApp();

const projectPayload = (overrides: Record<string, unknown> = {}) => ({
  title: 'Portfolio Case Study',
  slug: '',
  shortDescription: 'A case study created by the automated integration test suite.',
  fullDescription: 'A longer project overview used to verify admin project creation and updates.',
  category: 'Web Applications',
  projectStatus: 'In Progress',
  contribution: 'Built the API and user interface.',
  keyFeatures: ['Authentication', 'Dashboard'],
  challenges: 'Testing challenge',
  solutions: 'Testing solution',
  technologies: ['TypeScript', 'Express'],
  repositoryUrl: '',
  liveUrl: '',
  startDate: '2026-01-01',
  endDate: '',
  featured: false,
  published: false,
  ...overrides,
});

const pngBuffer = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64',
);

describe('Admin content management', () => {
  let agent: ReturnType<typeof request.agent>;
  let csrfToken: string;

  beforeEach(async () => {
    await resetDatabase();
    await createAdmin();
    await createProfile();
    const session = await login(app);
    agent = session.agent;
    csrfToken = session.csrfToken;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('creates, updates, publishes and deletes a project', async () => {
    const created = await agent
      .post('/api/admin/projects')
      .set('X-CSRF-Token', csrfToken)
      .send(projectPayload());

    expect(created.status).toBe(201);
    expect(created.body.data.slug).toBe('portfolio-case-study');
    expect(created.body.data.published).toBe(false);
    const projectId = created.body.data.id as number;

    const duplicate = await agent
      .post('/api/admin/projects')
      .set('X-CSRF-Token', csrfToken)
      .send(projectPayload({ title: 'Second Project' }));
    expect(duplicate.status).toBe(201);
    expect(duplicate.body.data.slug).toBe('second-project');

    const updated = await agent
      .put(`/api/admin/projects/${projectId}`)
      .set('X-CSRF-Token', csrfToken)
      .send(projectPayload({ published: true, featured: true, title: 'Updated Case Study' }));

    expect(updated.status).toBe(200);
    expect(updated.body.data.published).toBe(true);
    expect(updated.body.data.featured).toBe(true);
    expect(updated.body.data.title).toBe('Updated Case Study');

    const publicResponse = await request(app).get(`/api/projects/${updated.body.data.slug}`);
    expect(publicResponse.status).toBe(200);

    const deleted = await agent
      .delete(`/api/admin/projects/${projectId}`)
      .set('X-CSRF-Token', csrfToken);
    expect(deleted.status).toBe(200);
    expect(await prisma.project.count()).toBe(1);
  });

  it('rejects invalid project data with field-level errors', async () => {
    const response = await agent
      .post('/api/admin/projects')
      .set('X-CSRF-Token', csrfToken)
      .send(projectPayload({ title: '', shortDescription: 'short' }));

    expect(response.status).toBe(422);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
    expect(response.body.error.details.title).toBeDefined();
    expect(response.body.error.details.shortDescription).toBeDefined();
  });

  it('uploads and deletes project images with magic-byte validation', async () => {
    const project = await prisma.project.create({
      data: {
        title: 'Image Project',
        slug: 'image-project',
        shortDescription: 'Project used to test image uploads.',
        fullDescription: 'A longer description for the image upload integration test.',
        category: 'Web Applications',
        published: true,
      },
    });

    const rejected = await agent
      .post(`/api/admin/projects/${project.id}/images`)
      .set('X-CSRF-Token', csrfToken)
      .attach('image', Buffer.from('this is not an image file'), 'fake.png');
    expect(rejected.status).toBe(422);
    expect(rejected.body.error.code).toBe('INVALID_FILE_TYPE');

    const uploaded = await agent
      .post(`/api/admin/projects/${project.id}/images`)
      .set('X-CSRF-Token', csrfToken)
      .attach('image', pngBuffer, 'screenshot.png');
    expect(uploaded.status).toBe(201);
    expect(uploaded.body.data.project.images).toHaveLength(1);

    const imageId = uploaded.body.data.project.images[0].id as number;
    const removed = await agent
      .delete(`/api/admin/projects/${project.id}/images/${imageId}`)
      .set('X-CSRF-Token', csrfToken);
    expect(removed.status).toBe(200);
    expect(await prisma.projectImage.count()).toBe(0);
  });

  it('manages skills, messages and site settings', async () => {
    const skill = await agent
      .post('/api/admin/skills')
      .set('X-CSRF-Token', csrfToken)
      .send({ name: 'SQL', category: 'Databases', visible: true });
    expect(skill.status).toBe(201);

    const message = await prisma.contactMessage.create({
      data: {
        name: 'Test Sender',
        email: 'sender@example.com',
        subject: 'Testing messages',
        message: 'This message is used to verify inbox management endpoints.',
      },
    });

    const inbox = await agent.get('/api/admin/messages');
    expect(inbox.status).toBe(200);
    expect(inbox.body.data.items).toHaveLength(1);
    expect(inbox.body.data.counts.unread).toBe(1);

    const marked = await agent
      .patch(`/api/admin/messages/${message.id}`)
      .set('X-CSRF-Token', csrfToken)
      .send({ isRead: true });
    expect(marked.status).toBe(200);
    expect(marked.body.data.isRead).toBe(true);

    const settings = await agent.put('/api/admin/settings').set('X-CSRF-Token', csrfToken).send({
      websiteTitle: 'Updated Test Portfolio',
      websiteDescription: 'An updated description for the automated integration test.',
      footerTagline: 'Testing only',
      contactNotificationEmail: 'notifications@example.com',
      siteUrl: 'https://example.com',
    });
    expect(settings.status).toBe(200);
    expect(settings.body.data.contactNotificationEmail).toBe('notifications@example.com');

    const publicSettings = await request(app).get('/api/settings');
    expect(publicSettings.body.data.siteUrl).toBe('https://example.com');
    expect(publicSettings.body.data.footerTagline).toBe('Testing only');
  });

  it('uploads a PDF CV and exposes it publicly only when allowed', async () => {
    const pdf = Buffer.from('%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF');

    const uploaded = await agent
      .post('/api/admin/cv')
      .set('X-CSRF-Token', csrfToken)
      .field('title', 'Test CV')
      .field('isPublic', 'true')
      .attach('cv', pdf, 'cv.pdf');

    expect(uploaded.status).toBe(201);
    expect(uploaded.body.data.isPublic).toBe(true);

    const metadata = await request(app).get('/api/cv');
    expect(metadata.status).toBe(200);
    expect(metadata.body.data.title).toBe('Test CV');

    const download = await request(app).get('/api/cv/download');
    expect(download.status).toBe(200);
    expect(download.headers['content-type']).toContain('pdf');

    const id = uploaded.body.data.id as number;
    const updated = await agent
      .put(`/api/admin/cv/${id}`)
      .set('X-CSRF-Token', csrfToken)
      .send({ title: 'Private CV', isPublic: false });
    expect(updated.status).toBe(200);

    const hiddenMetadata = await request(app).get('/api/cv');
    expect(hiddenMetadata.body.data).toBeNull();
    const hiddenDownload = await request(app).get('/api/cv/download');
    expect(hiddenDownload.status).toBe(404);
  });
});
