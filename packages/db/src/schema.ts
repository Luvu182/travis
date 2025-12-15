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
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// ==================== ENUMS ====================

export const platformEnum = pgEnum('platform_type', ['telegram', 'lark']);

export const infoTypeEnum = pgEnum('info_type', [
  'task',
  'decision',
  'deadline',
  'important',
  'general',
]);

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

// Extracted info table (tasks, decisions, deadlines)
export const extractedInfo = pgTable('extracted_info', {
  id: uuid('id').primaryKey().defaultRandom(),
  messageId: uuid('message_id').references(() => messages.id, { onDelete: 'cascade' }),
  groupId: uuid('group_id').references(() => groups.id, { onDelete: 'cascade' }),
  infoType: infoTypeEnum('info_type').notNull(),
  content: text('content').notNull(),
  summary: text('summary'),
  assigneeUserId: uuid('assignee_user_id').references(() => users.id),
  dueDate: timestamp('due_date', { withTimezone: true }),
  status: varchar('status', { length: 50 }).default('active'),
  embedding: vector('embedding', { dimensions: 1536 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  metadata: jsonb('metadata').default({}),
}, (table) => ({
  infoTypeIdx: index('idx_extracted_info_type').on(table.infoType),
  groupCreatedIdx: index('idx_extracted_info_group_created')
    .on(table.groupId, table.createdAt),
  assigneeIdx: index('idx_extracted_info_assignee').on(table.assigneeUserId),
  statusIdx: index('idx_extracted_info_status').on(table.status),
}));

// Memories table (for mem0 or direct vector storage)
export const memories = pgTable('memories', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: varchar('user_id', { length: 255 }),  // mem0 user context
  agentId: varchar('agent_id', { length: 255 }),  // mem0 agent context
  groupId: uuid('group_id').references(() => groups.id),
  content: text('content').notNull(),
  embedding: vector('embedding', { dimensions: 1536 }),
  memoryType: varchar('memory_type', { length: 50 }),  // fact, preference, context
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  metadata: jsonb('metadata').default({}),
}, (table) => ({
  userIdx: index('idx_memories_user').on(table.userId),
  groupIdx: index('idx_memories_group').on(table.groupId),
  memoryTypeIdx: index('idx_memories_type').on(table.memoryType),
}));

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

// ==================== TYPE EXPORTS ====================

export type Group = typeof groups.$inferSelect;
export type NewGroup = typeof groups.$inferInsert;

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;

export type ExtractedInfo = typeof extractedInfo.$inferSelect;
export type NewExtractedInfo = typeof extractedInfo.$inferInsert;

export type Memory = typeof memories.$inferSelect;
export type NewMemory = typeof memories.$inferInsert;

export type QueryLog = typeof queryLogs.$inferSelect;
export type NewQueryLog = typeof queryLogs.$inferInsert;
