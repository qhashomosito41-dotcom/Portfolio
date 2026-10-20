import dotenv from 'dotenv';
import path from 'node:path';
import { z } from 'zod';

const nodeEnv = process.env.NODE_ENV ?? 'development';
dotenv.config({ path: path.resolve(process.cwd(), nodeEnv === 'test' ? '.env.test' : '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const emptyToUndefined = (value: unknown) => {
  if (typeof value === 'string' && value.trim() === '') return undefined;
  return value;
};

const optionalString = z.preprocess(emptyToUndefined, z.string().trim().optional());
const optionalEmail = z.preprocess(emptyToUndefined, z.string().email().optional());
const booleanString = z
  .preprocess(emptyToUndefined, z.enum(['true', 'false']).optional())
  .transform((value) => value === 'true');

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().max(65535).default(4000),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  SESSION_SECRET: z.string().min(32, 'SESSION_SECRET must be at least 32 characters'),
  SESSION_COOKIE_NAME: z.string().min(1).default('mosito_session'),
  SESSION_TTL_HOURS: z.coerce.number().min(1).max(720).default(8),
  CLIENT_ORIGIN: z.string().url().default('http://localhost:5173'),
  SITE_URL: z.string().url().default('http://localhost:4000'),
  STORAGE_DIR: z.string().min(1).default('../storage'),
  LOG_LEVEL: z.string().default('info'),
  LOGIN_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(10),
  CONTACT_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(5),
  ADMIN_EMAIL: optionalEmail,
  ADMIN_PASSWORD: optionalString,
  ADMIN_NAME: optionalString,
  SMTP_HOST: optionalString,
  SMTP_PORT: z.coerce.number().int().positive().default(587),
  SMTP_SECURE: booleanString,
  SMTP_USER: optionalString,
  SMTP_PASSWORD: optionalString,
  SMTP_FROM: optionalString,
  CONTACT_NOTIFICATION_EMAIL: optionalEmail,
  COOKIE_SECURE: booleanString,
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
  throw new Error(`Invalid environment configuration:\n${issues.join('\n')}`);
}

const raw = parsed.data;

if (raw.NODE_ENV === 'production' && raw.SESSION_SECRET.startsWith('replace-')) {
  throw new Error('SESSION_SECRET must be changed before running in production');
}

export const env = {
  ...raw,
  isProduction: raw.NODE_ENV === 'production',
  isTest: raw.NODE_ENV === 'test',
  storageDir: path.isAbsolute(raw.STORAGE_DIR)
    ? raw.STORAGE_DIR
    : path.resolve(process.cwd(), raw.STORAGE_DIR),
  cookieSecure: raw.COOKIE_SECURE || raw.NODE_ENV === 'production',
  allowedOrigins: Array.from(new Set([raw.CLIENT_ORIGIN, raw.SITE_URL])),
};
