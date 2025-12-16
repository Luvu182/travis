/**
 * Auth-specific database client using node-postgres (pg)
 * Required for @auth/drizzle-adapter compatibility
 *
 * Note: Main app uses postgres-js for better performance
 * This client is only used by NextAuth adapter
 */
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { env } from '@jarvis/config';

// Create a separate pool for auth operations
const authPool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 5, // Small pool for auth-only operations
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// Export drizzle instance for auth adapter (no schema needed - adapter uses custom tables)
export const authDb = drizzle(authPool);

// Export pool for cleanup
export { authPool };
