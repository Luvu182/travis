import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '@jarvis/config';
import * as schema from './schema.js';
import { sql } from 'drizzle-orm';

// Lazy initialization of database connection with mutex to prevent race conditions
let _db: ReturnType<typeof drizzle> | null = null;
let _client: postgres.Sql | null = null;
let _initializing = false;

async function getDb() {
  // Wait if another request is initializing
  while (_initializing) {
    await new Promise(resolve => setTimeout(resolve, 10));
  }

  if (!_db) {
    _initializing = true;
    try {
      _client = postgres(env.DATABASE_URL, {
        max: env.NODE_ENV === 'production' ? 20 : 1,
        idle_timeout: 30,
        connect_timeout: 10,
      });
      _db = drizzle(_client, { schema });
    } finally {
      _initializing = false;
    }
  }
  return _db;
}

// Export db as a Proxy for lazy initialization
export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get: (target, prop) => {
    const dbInstance = getDb();
    const value = dbInstance[prop as keyof typeof dbInstance];
    return typeof value === 'function' ? value.bind(dbInstance) : value;
  }
});

// Health check function
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    if (!_client) {
      getDb(); // Initialize if needed
    }
    await _client!`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

// Close connection (for graceful shutdown)
export async function closeDatabaseConnection(): Promise<void> {
  if (_client) {
    await _client.end();
    _client = null;
    _db = null;
  }
}
