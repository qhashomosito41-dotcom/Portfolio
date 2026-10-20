import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { prisma, ADMIN, createAdmin, createProfile, login, resetDatabase } from './helpers';
import type { ProfileInput } from './types';

const app = createApp();

const profilePayload = (): ProfileInput => ({
  fullName: 'Test Person',
  professionalTitle: 'Software Developer',
  headline: 'Building useful software',
  heroIntro: 'A test profile used by the automated test suite for the portfolio application.',
  heroTechSummary: ['TypeScript'],
  biography: 'A biography long enough for validation in the automated test suite.',
  academicBackground: '',
  approach: '',
  careerObjectives: '',
  professionalInterests: ['Web development'],
  location: 'Maseru',
  contactEmail: 'hello@example.com',
});

describe('Authentication and CSRF protection', () => {
  beforeEach(async () => {
    await resetDatabase();
    await createAdmin();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('rejects invalid credentials without creating a session', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: ADMIN.email, password: 'wrong-password' });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('UNAUTHORIZED');
    expect(await prisma.adminSession.count()).toBe(0);
  });

  it('creates an HTTP-only session cookie on successful login', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: ADMIN.email, password: ADMIN.password });

    expect(response.status).toBe(200);
    expect(response.body.data.authenticated).toBe(true);
    expect(response.body.data.admin.email).toBe(ADMIN.email);
    expect(typeof response.body.data.csrfToken).toBe('string');

    const setCookie = response.headers['set-cookie'] as unknown as string[];
    expect(setCookie.join(';')).toContain('HttpOnly');
    expect(setCookie.join(';')).toContain('SameSite=Lax');

    const session = await prisma.adminSession.findFirst();
    expect(session).not.toBeNull();
    expect(session?.csrfToken).toBe(response.body.data.csrfToken);
  });

  it('reports the session and protects admin routes', async () => {
    const anonymous = await request(app).get('/api/admin/dashboard');
    expect(anonymous.status).toBe(401);

    const { agent } = await login(app);
    const session = await agent.get('/api/auth/session');
    expect(session.status).toBe(200);
    expect(session.body.data.authenticated).toBe(true);

    const dashboard = await agent.get('/api/admin/dashboard');
    expect(dashboard.status).toBe(200);
    expect(dashboard.body.data.stats).toBeDefined();
  });

  it('requires a valid CSRF token for state-changing admin requests', async () => {
    await createProfile();
    const { agent, csrfToken } = await login(app);

    const withoutToken = await agent.put('/api/admin/profile').send(profilePayload());
    expect(withoutToken.status).toBe(403);
    expect(withoutToken.body.error.code).toBe('FORBIDDEN');

    const invalidToken = await agent
      .put('/api/admin/profile')
      .set('X-CSRF-Token', 'not-the-right-token')
      .send(profilePayload());
    expect(invalidToken.status).toBe(403);

    const withToken = await agent
      .put('/api/admin/profile')
      .set('X-CSRF-Token', csrfToken)
      .send(profilePayload());
    expect(withToken.status).toBe(200);
    expect(withToken.body.data.fullName).toBe('Test Person');
  });

  it('invalidates the session on logout', async () => {
    const { agent, csrfToken } = await login(app);

    const logout = await agent.post('/api/auth/logout').set('X-CSRF-Token', csrfToken);
    expect(logout.status).toBe(200);

    const session = await agent.get('/api/auth/session');
    expect(session.body.data.authenticated).toBe(false);
    expect(await prisma.adminSession.count()).toBe(0);
  });
});
