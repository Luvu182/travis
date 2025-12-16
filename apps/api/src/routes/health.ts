import { Hono } from 'hono';
import { checkDatabaseConnection } from '@jarvis/db';

export const healthRoutes = new Hono();

healthRoutes.get('/', async (c) => {
  const checks = {
    api: true,
    database: false,
  };

  try {
    // Use checkDatabaseConnection from @jarvis/db instead of direct SQL execution
    await checkDatabaseConnection();
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
