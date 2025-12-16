// Load .env before importing config
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Find monorepo root (go up from apps/api to root)
const currentDir = process.cwd();
const monorepoRoot = path.resolve(currentDir, '../..');
const envPath = path.join(monorepoRoot, '.env');

console.log('[ENV] Loading .env from:', envPath);
const result = dotenv.config({ path: envPath });
if (result.error) {
  console.error('[ENV] Failed to load .env:', result.error);
  process.exit(1);
} else {
  console.log('[ENV] Successfully loaded .env');
}

import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { env } from '@travis/config';

import { healthRoutes } from './routes/health.js';
import { telegramWebhook } from './webhooks/telegram.js';
import { larkWebhook } from './webhooks/lark.js';
import { errorHandler } from './middleware/error.js';

const app = new Hono();

// Global middleware
app.use('*', logger());
app.use('*', cors());
app.onError(errorHandler);

// Health routes
app.route('/health', healthRoutes);

// Webhook routes
app.route('/webhook/telegram', telegramWebhook);
app.route('/webhook/lark', larkWebhook);

// Start server
const port = Number(env.PORT);
console.log(`Starting LuxBot API on port ${port}...`);

serve({
  fetch: app.fetch,
  port,
}, (info) => {
  console.log(`LuxBot API running at http://localhost:${info.port}`);
});

export default app;
