import 'dotenv/config';
import type { Config } from 'drizzle-kit';
import { env } from '@luxbot/config';

export default {
  schema: './src/schema.ts',
  out: './src/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: env.DATABASE_URL,
  },
} satisfies Config;
