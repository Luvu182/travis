import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '@jarvis/config';
import * as schema from './schema';

// Eager initialization - create connection on module load
const client = postgres(env.DATABASE_URL, {
  max: env.NODE_ENV === 'production' ? 20 : 1,
  idle_timeout: 30,
  connect_timeout: 10,
});

export const db = drizzle(client, { schema });

// Health check function
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await client`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

// Close connection (for graceful shutdown)
export async function closeDatabaseConnection(): Promise<void> {
  await client.end();
}
