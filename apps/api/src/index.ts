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
import { env } from '@jarvis/config';

import { healthRoutes } from './routes/health.js';
import { chatRoutes } from './routes/chat.js';
import { extractRoutes } from './routes/extract.js';
import { searchRoutes } from './routes/search.js';
import { queryRoutes } from './routes/query.js';
import { metricsRoutes } from './routes/metrics.js';
import { authRoutes } from './routes/auth.js';
import { dashboardMetricsRoutes } from './routes/dashboard-metrics.js';
import { workspaceRoutes } from './routes/workspaces.js';
import { telegramWebhook } from './webhooks/telegram.js';
import { larkWebhook } from './webhooks/lark.js';
import { errorHandler } from './middleware/error.js';
import { rateLimiter, userGroupKeyGenerator } from './middleware/rate-limit.js';
import { dashboardAuthMiddleware } from './middleware/dashboard-auth.js';

const app = new Hono();

// Global middleware
app.use('*', logger());
app.use('*', cors());
app.onError(errorHandler);

// Health routes (no rate limiting)
app.route('/health', healthRoutes);

// Metrics routes (no rate limiting - internal monitoring)
app.route('/metrics', metricsRoutes);

// API routes with rate limiting (100 requests per 15 minutes per user+group)
const apiRateLimit = rateLimiter({
  maxRequests: 100,
  windowMs: 15 * 60 * 1000, // 15 minutes
  keyGenerator: userGroupKeyGenerator,
});

app.use('/api/*', apiRateLimit);
app.route('/api/chat', chatRoutes);
app.route('/api/extract', extractRoutes);
app.route('/api/search', searchRoutes);
app.route('/api/query', queryRoutes);

// Webhook routes (no rate limiting - handled by platforms)
app.route('/webhook/telegram', telegramWebhook);
app.route('/webhook/lark', larkWebhook);

// Dashboard auth routes (no rate limiting for login/logout)
app.route('/api/auth', authRoutes);

// Dashboard routes (protected by auth)
app.use('/api/dashboard/*', dashboardAuthMiddleware);
app.use('/api/workspaces/*', dashboardAuthMiddleware);
app.route('/api/dashboard', dashboardMetricsRoutes);
app.route('/api/workspaces', workspaceRoutes);

// Start server
const port = Number(env.PORT);
console.log(`Starting J.A.R.V.I.S API on port ${port}...`);

serve({
  fetch: app.fetch,
  port,
}, (info) => {
  console.log(`J.A.R.V.I.S API running at http://localhost:${info.port}`);
});

export default app;
