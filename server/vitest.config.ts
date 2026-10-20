import { defineConfig } from 'vitest/config';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const envFile = readFileSync(resolve(__dirname, '.env.test'), 'utf8');
const testEnv: Record<string, string> = {};
for (const line of envFile.split(/\r?\n/)) {
  const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (match) {
    testEnv[match[1]] = match[2].replace(/^"|"$/g, '');
  }
}

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['tests/**/*.test.ts'],
    globalSetup: ['./tests/global-setup.ts'],
    fileParallelism: false,
    env: testEnv,
    hookTimeout: 30000,
    testTimeout: 20000,
  },
});
