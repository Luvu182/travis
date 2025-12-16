import { Hono } from 'hono';
import { db } from '@travis/db';
import { sql } from 'drizzle-orm';

export const healthRoutes = new Hono();

healthRoutes.get('/', async (c) => {
  const checks = {
    api: true,
    database: false,
  };

  try {
    await db.execute(sql`SELECT 1`);
    checks.database = true;
  } catch (error) {
    console.error('Database health check failed:', error);
  }

  const allHealthy = Object.values(checks).every(Boolean);

  return c.json({
    status: allHealthy ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    checks,
  }, allHealthy ? 200 : 503);
});
