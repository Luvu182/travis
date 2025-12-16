import { Context, Next } from 'hono';

/**
 * Simple in-memory rate limiter
 * For production, use Redis-based rate limiting (e.g., @hono/rate-limiter with Redis)
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store (per-process)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

export interface RateLimitConfig {
  /**
   * Max requests per window
   */
  maxRequests: number;
  /**
   * Window duration in milliseconds
   */
  windowMs: number;
  /**
   * Key generator function
   * Default: uses userId from request body
   */
  keyGenerator?: (c: Context) => string | Promise<string>;
}

/**
 * Rate limiting middleware
 *
 * @param config Rate limit configuration
 * @returns Hono middleware function
 */
export function rateLimiter(config: RateLimitConfig) {
  const {
    maxRequests,
    windowMs,
    keyGenerator = defaultKeyGenerator,
  } = config;

  return async (c: Context, next: Next) => {
    try {
      // 1. Generate rate limit key
      const key = await keyGenerator(c);
      if (!key) {
        // If no key, skip rate limiting
        return next();
      }

      const now = Date.now();
      const entry = rateLimitStore.get(key);

      // 2. Check if rate limit exceeded
      if (entry) {
        if (now < entry.resetTime) {
          // Within window
          if (entry.count >= maxRequests) {
            // Rate limit exceeded
            const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
            return c.json(
              {
                success: false,
                error: 'Rate limit exceeded',
                retryAfter,
              },
              429,
              {
                'Retry-After': retryAfter.toString(),
                'X-RateLimit-Limit': maxRequests.toString(),
                'X-RateLimit-Remaining': '0',
                'X-RateLimit-Reset': new Date(entry.resetTime).toISOString(),
              }
            );
          } else {
            // Increment count
            entry.count++;
          }
        } else {
          // Window expired, reset
          rateLimitStore.set(key, {
            count: 1,
            resetTime: now + windowMs,
          });
        }
      } else {
        // First request
        rateLimitStore.set(key, {
          count: 1,
          resetTime: now + windowMs,
        });
      }

      // 3. Set rate limit headers
      const currentEntry = rateLimitStore.get(key)!;
      const remaining = Math.max(0, maxRequests - currentEntry.count);

      c.header('X-RateLimit-Limit', maxRequests.toString());
      c.header('X-RateLimit-Remaining', remaining.toString());
      c.header('X-RateLimit-Reset', new Date(currentEntry.resetTime).toISOString());

      // 4. Proceed to next middleware
      return next();
    } catch (error) {
      console.error('[RateLimit] Error:', error);
      // On error, allow request to proceed
      return next();
    }
  };
}

/**
 * Default key generator: userId from request body
 */
async function defaultKeyGenerator(c: Context): Promise<string> {
  try {
    const body = await c.req.json();
    return body.userId || '';
  } catch {
    return '';
  }
}

/**
 * Group-based key generator: groupId from request body
 */
export async function groupKeyGenerator(c: Context): Promise<string> {
  try {
    const body = await c.req.json();
    return body.groupId || '';
  } catch {
    return '';
  }
}

/**
 * User+Group key generator: userId:groupId from request body
 */
export async function userGroupKeyGenerator(c: Context): Promise<string> {
  try {
    const body = await c.req.json();
    const userId = body.userId || '';
    const groupId = body.groupId || '';
    return userId && groupId ? `${userId}:${groupId}` : '';
  } catch {
    return '';
  }
}
