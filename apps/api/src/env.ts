/**
 * Must be the first import in main.ts and api/index.ts — it has to run
 * before any other module import (Prisma included) reaches for process.env.
 *
 * ConfigModule.forRoot() also loads the .env file, but too late: Node
 * resolves every top-level `import` in the module graph before Nest's
 * decorators run, so anything that reads process.env at import time (like
 * PrismaService) would otherwise see an empty environment during local dev.
 *
 * In production (Vercel) no .env file is deployed — real values are
 * injected into process.env directly by the platform — so this is a no-op
 * there and never overrides an already-set variable.
 */
import { config } from 'dotenv';
import { existsSync } from 'fs';
import { resolve } from 'path';

const candidates = [
  resolve(process.cwd(), '../../.env'),
  resolve(process.cwd(), '.env'),
  resolve(__dirname, '../../../.env'),
  resolve(__dirname, '../.env'),
];

for (const candidate of candidates) {
  if (existsSync(candidate)) {
    config({ path: candidate });
    break;
  }
}
