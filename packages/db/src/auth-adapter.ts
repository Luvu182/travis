/**
 * NextAuth Drizzle Adapter configuration
 * Uses node-postgres (pg) client for database sessions
 * See: https://authjs.dev/getting-started/adapters/drizzle
 */
import type { Adapter } from '@auth/core/adapters';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { authDb } from './auth-client';
import { adminUsers, authAccounts, authSessions, authVerificationTokens } from './schema';

export const authAdapter: Adapter = DrizzleAdapter(authDb, {
  usersTable: adminUsers,
  accountsTable: authAccounts,
  sessionsTable: authSessions,
  verificationTokensTable: authVerificationTokens,
});
