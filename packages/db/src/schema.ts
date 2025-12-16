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

// ==================== ADMIN AUTH TABLES ====================

// Admin users table (for dashboard authentication)
export const adminUsers = pgTable('admin_users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  displayName: varchar('display_name', { length: 255 }),
  role: varchar('role', { length: 50 }).notNull().default('admin'),
  isActive: boolean('is_active').notNull().default(true),
  lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  emailIdx: uniqueIndex('idx_admin_users_email').on(table.email),
}));

// Refresh tokens table (for JWT refresh token management)
export const refreshTokens = pgTable('refresh_tokens', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => adminUsers.id, { onDelete: 'cascade' }),
  tokenHash: varchar('token_hash', { length: 255 }).notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  revokedAt: timestamp('revoked_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  tokenHashIdx: index('idx_refresh_tokens_hash').on(table.tokenHash),
  userIdx: index('idx_refresh_tokens_user').on(table.userId),
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
