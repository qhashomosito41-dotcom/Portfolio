import { execSync } from 'node:child_process';
import { readFileSync, rmSync } from 'node:fs';
import path from 'node:path';
import { PrismaClient } from '@prisma/client';
import teardown from './global-teardown';

const parseEnv = (file: string) => {
  const values: Record<string, string> = {};
  for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (match) values[match[1]] = match[2].replace(/^"|"$/g, '');
  }
  return values;
};

export default async function setup() {
  const root = process.cwd();
  const testEnv = parseEnv(path.resolve(root, '.env.test'));
  const databaseUrl = testEnv.DATABASE_URL;

  if (!databaseUrl.includes('_test')) {
    throw new Error('Refusing to prepare tests: DATABASE_URL must point at a test database');
  }

  execSync('npx prisma migrate deploy', {
    cwd: root,
    env: { ...process.env, ...testEnv },
    stdio: 'pipe',
  });

  const prisma = new PrismaClient({ datasources: { db: { url: databaseUrl } } });

  try {
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
  } finally {
    await prisma.$disconnect();
  }

  rmSync(path.resolve(root, '..', 'storage-test'), { recursive: true, force: true });

  return teardown;
}
