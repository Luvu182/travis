import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  jsonb,
  integer,
  pgEnum,
  uniqueIndex,
  index,
  vector,
  boolean,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// ==================== ENUMS ====================

export const platformEnum = pgEnum('platform_type', ['telegram', 'lark']);

// ==================== TABLES ====================

// Groups/Chats table
export const groups = pgTable('groups', {
  id: uuid('id').primaryKey().defaultRandom(),
  platform: platformEnum('platform').notNull(),
  platformGroupId: varchar('platform_group_id', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  metadata: jsonb('metadata').default({}),
}, (table) => ({
  platformGroupUnique: uniqueIndex('idx_groups_platform_group')
    .on(table.platform, table.platformGroupId),
}));

// Users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  platform: platformEnum('platform').notNull(),
  platformUserId: varchar('platform_user_id', { length: 255 }).notNull(),
  username: varchar('username', { length: 255 }),
  displayName: varchar('display_name', { length: 255 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  metadata: jsonb('metadata').default({}),
}, (table) => ({
  platformUserUnique: uniqueIndex('idx_users_platform_user')
    .on(table.platform, table.platformUserId),
}));

// Messages table (raw message log)
export const messages = pgTable('messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  groupId: uuid('group_id').references(() => groups.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  platformMessageId: varchar('platform_message_id', { length: 255 }).notNull(),
  content: text('content').notNull(),
  replyToMessageId: varchar('reply_to_message_id', { length: 255 }),
  threadId: varchar('thread_id', { length: 255 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  metadata: jsonb('metadata').default({}),
}, (table) => ({
  groupMessageUnique: uniqueIndex('idx_messages_group_platform')
    .on(table.groupId, table.platformMessageId),
  groupCreatedIdx: index('idx_messages_group_created')
    .on(table.groupId, table.createdAt),
  userIdx: index('idx_messages_user').on(table.userId),
}));

// Note: Memory tables managed by mem0 OSS (not in this schema)

// Query logs (for analytics)
export const queryLogs = pgTable('query_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  groupId: uuid('group_id').references(() => groups.id),
  userId: uuid('user_id').references(() => users.id),
  queryText: text('query_text').notNull(),
  responseText: text('response_text'),
  memoriesUsed: uuid('memories_used').array(),
  latencyMs: integer('latency_ms'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// ==================== AUTH TABLES (NextAuth v5 Compatible) ====================
// Schema follows @auth/drizzle-adapter default schema
// See: https://authjs.dev/getting-started/adapters/drizzle

// Role enum for RBAC (custom extension)
export const authRoleEnum = pgEnum('auth_role', ['admin', 'user']);

// Users table (NextAuth compatible + custom fields)
export const adminUsers = pgTable('user', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name'),
  email: text('email').notNull().unique(),
  emailVerified: timestamp('emailVerified', { mode: 'date' }),
  image: text('image'),
  // Custom fields for Jarvis
  passwordHash: text('password_hash'),
  role: authRoleEnum('role').notNull().default('user'),
  isActive: boolean('is_active').notNull().default(true),
  lastLoginAt: timestamp('last_login_at', { mode: 'date' }),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow(),
});

// Sessions table (NextAuth compatible)
export const authSessions = pgTable('session', {
  sessionToken: text('sessionToken').primaryKey(),
  userId: text('userId').notNull().references(() => adminUsers.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
});

// Accounts table (NextAuth compatible - for OAuth)
export const authAccounts = pgTable('account', {
  userId: text('userId').notNull().references(() => adminUsers.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  provider: text('provider').notNull(),
  providerAccountId: text('providerAccountId').notNull(),
  refresh_token: text('refresh_token'),
  access_token: text('access_token'),
  expires_at: integer('expires_at'),
  token_type: text('token_type'),
  scope: text('scope'),
  id_token: text('id_token'),
  session_state: text('session_state'),
}, (account) => ({
  compoundKey: uniqueIndex('account_provider_providerAccountId_idx')
    .on(account.provider, account.providerAccountId),
}));

// Verification tokens table (NextAuth compatible)
export const authVerificationTokens = pgTable('verificationToken', {
  identifier: text('identifier').notNull(),
  token: text('token').notNull(),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
}, (vt) => ({
  compoundKey: uniqueIndex('verificationToken_identifier_token_idx')
    .on(vt.identifier, vt.token),
}));

// Refresh tokens table (for JWT refresh token management if needed)
export const refreshTokens = pgTable('refresh_tokens', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull().references(() => adminUsers.id, { onDelete: 'cascade' }),
  tokenHash: text('token_hash').notNull(),
  expiresAt: timestamp('expires_at', { mode: 'date' }).notNull(),
  revokedAt: timestamp('revoked_at', { mode: 'date' }),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow(),
}, (table) => ({
  tokenHashIdx: index('idx_refresh_tokens_hash').on(table.tokenHash),
  userIdx: index('idx_refresh_tokens_user').on(table.userId),
}));

// ==================== WEB CHAT TABLES ====================

// Web chat conversations (dashboard chat sessions)
export const webConversations = pgTable('web_conversations', {
  id: uuid('id').primaryKey().defaultRandom(),
  adminUserId: text('admin_user_id').notNull().references(() => adminUsers.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).default('New Chat'),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow(),
}, (table) => ({
  userIdx: index('idx_web_conversations_user').on(table.adminUserId),
  updatedIdx: index('idx_web_conversations_updated').on(table.updatedAt),
}));

// Web chat messages (messages in dashboard chat)
export const webMessages = pgTable('web_messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  conversationId: uuid('conversation_id').notNull().references(() => webConversations.id, { onDelete: 'cascade' }),
  role: varchar('role', { length: 20 }).notNull(), // 'user' | 'assistant'
  content: text('content').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  conversationIdx: index('idx_web_messages_conversation').on(table.conversationId),
  createdIdx: index('idx_web_messages_created').on(table.createdAt),
}));

// ==================== METRICS TABLES ====================

// Metrics history table (for dashboard analytics)
export const metricsHistory = pgTable('metrics_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  metricName: varchar('metric_name', { length: 100 }).notNull(),
  metricType: varchar('metric_type', { length: 50 }).notNull(), // gauge, counter, histogram
  value: varchar('value', { length: 50 }).notNull(),
  labels: jsonb('labels').default({}),
  timestamp: timestamp('timestamp', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  nameTimestampIdx: index('idx_metrics_name_timestamp').on(table.metricName, table.timestamp),
  timestampIdx: index('idx_metrics_timestamp').on(table.timestamp),
}));

// ==================== TYPE EXPORTS ====================

export type Group = typeof groups.$inferSelect;
export type NewGroup = typeof groups.$inferInsert;

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;

export type QueryLog = typeof queryLogs.$inferSelect;
export type NewQueryLog = typeof queryLogs.$inferInsert;

export type AdminUser = typeof adminUsers.$inferSelect;
export type NewAdminUser = typeof adminUsers.$inferInsert;

export type RefreshToken = typeof refreshTokens.$inferSelect;
export type NewRefreshToken = typeof refreshTokens.$inferInsert;

export type MetricsHistory = typeof metricsHistory.$inferSelect;
export type NewMetricsHistory = typeof metricsHistory.$inferInsert;

export type WebConversation = typeof webConversations.$inferSelect;
export type NewWebConversation = typeof webConversations.$inferInsert;

export type WebMessage = typeof webMessages.$inferSelect;
export type NewWebMessage = typeof webMessages.$inferInsert;
