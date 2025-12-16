import { Context, Next } from 'hono';
import { getCookie } from 'hono/cookie';
import { jwtVerify } from 'jose';
import { env } from '@jarvis/config';

const jwtSecret = new TextEncoder().encode(env.JWT_SECRET);

/**
 * Middleware to protect dashboard API routes
 * Verifies JWT access token from httpOnly cookie
 */
export async function dashboardAuthMiddleware(c: Context, next: Next) {
  const accessToken = getCookie(c, 'access_token');

  if (!accessToken) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const { payload } = await jwtVerify(accessToken, jwtSecret);
    // Set user info in context for downstream handlers
    c.set('userId', payload.sub);
    c.set('userEmail', payload.email);
    c.set('userRole', payload.role);
    await next();
  } catch {
    return c.json({ error: 'Invalid token' }, 401);
  }
}
