import { Algorithm, hash } from '@node-rs/argon2';
import dotenv from 'dotenv';
import path from 'node:path';
import { PrismaClient } from '@prisma/client';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const prisma = new PrismaClient();

const readArg = (name: string): string | undefined => {
  const prefix = `--${name}=`;
  const inline = process.argv.find((arg) => arg.startsWith(prefix));
  if (inline) return inline.slice(prefix.length);
  const index = process.argv.indexOf(`--${name}`);
  if (index !== -1) return process.argv[index + 1];
  return undefined;
};

const main = async () => {
  const email = (readArg('email') ?? process.env.ADMIN_EMAIL ?? '').trim().toLowerCase();
  const password = readArg('password') ?? process.env.ADMIN_PASSWORD ?? '';
  const name = (readArg('name') ?? process.env.ADMIN_NAME ?? 'Mosito Qhasho').trim();
  const force = process.argv.includes('--force');

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('Provide a valid administrator email with --email or ADMIN_EMAIL');
  }
  if (password.length < 12) {
    throw new Error('The administrator password must be at least 12 characters long');
  }
  if (!name) {
    throw new Error('Provide an administrator name');
  }

  const existing = await prisma.adminUser.findUnique({ where: { email } });
  const passwordHash = await hash(password, {
    algorithm: Algorithm.Argon2id,
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1,
    outputLen: 32,
  });

  if (existing) {
    if (!force) {
      throw new Error(
        `An administrator with ${email} already exists. Use --force to reset the password.`,
      );
    }
    await prisma.adminUser.update({
      where: { id: existing.id },
      data: { name, passwordHash },
    });
    await prisma.adminSession.deleteMany({ where: { adminUserId: existing.id } });
    console.log(`Administrator password updated for ${email}. Existing sessions were invalidated.`);
    return;
  }

  const admin = await prisma.adminUser.create({
    data: { email, name, passwordHash },
  });
  console.log(`Administrator created: ${admin.email} (id ${admin.id})`);
  console.log('Store the password securely. It is not shown again by this command.');
};

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
