import { Algorithm, hash } from '@node-rs/argon2';
import { PrismaClient } from '@prisma/client';
import request from 'supertest';
import type { Express } from 'express';

export const prisma = new PrismaClient();

export const ADMIN = {
  email: 'test-admin@example.com',
  password: 'correct-horse-battery-staple',
  name: 'Test Administrator',
};

export const resetDatabase = async () => {
  await prisma.$transaction([
    prisma.projectImage.deleteMany(),
    prisma.project.deleteMany(),
    prisma.adminSession.deleteMany(),
    prisma.adminUser.deleteMany(),
    prisma.skill.deleteMany(),
    prisma.experience.deleteMany(),
    prisma.education.deleteMany(),
    prisma.certification.deleteMany(),
    prisma.cVDocument.deleteMany(),
    prisma.contactMessage.deleteMany(),
    prisma.socialLink.deleteMany(),
    prisma.siteSetting.deleteMany(),
    prisma.profile.deleteMany(),
  ]);
};

export const createAdmin = async () => {
  const passwordHash = await hash(ADMIN.password, {
    algorithm: Algorithm.Argon2id,
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1,
    outputLen: 32,
  });
  return prisma.adminUser.create({
    data: { email: ADMIN.email, name: ADMIN.name, passwordHash },
  });
};

export const createProfile = async (overrides: Record<string, unknown> = {}) =>
  prisma.profile.create({
    data: {
      fullName: 'Test Person',
      professionalTitle: 'Software Developer',
      headline: 'Building useful software',
      heroIntro: 'A test profile used by the automated test suite for the portfolio application.',
      heroTechSummary: JSON.stringify(['TypeScript', 'React']),
      biography:
        'This biography exists only for automated testing and is not shown in any production view.',
      professionalInterests: JSON.stringify(['Web development', 'Databases']),
      location: 'Maseru, Lesotho',
      contactEmail: 'hello@example.com',
      websiteTitle: 'Test Portfolio',
      websiteDescription: 'A portfolio site used for automated integration tests.',
      ...overrides,
    },
  });

export const createProject = async (overrides: Record<string, unknown> = {}) =>
  prisma.project.create({
    data: {
      title: 'Test Project',
      slug: 'test-project',
      shortDescription: 'A project created for automated integration testing.',
      fullDescription: 'This is a longer description used by the automated test suite only.',
      category: 'Web Applications',
      projectStatus: 'Completed',
      technologies: JSON.stringify(['TypeScript', 'React']),
      keyFeatures: JSON.stringify(['Feature one', 'Feature two']),
      published: true,
      featured: false,
      sortOrder: 1,
      ...overrides,
    },
  });

export const login = async (app: Express) => {
  const agent = request.agent(app);
  const response = await agent
    .post('/api/auth/login')
    .send({ email: ADMIN.email, password: ADMIN.password });
  if (response.status !== 200) {
    throw new Error(`Login failed in test helper: ${response.status}`);
  }
  return {
    agent,
    csrfToken: response.body.data.csrfToken as string,
  };
};
