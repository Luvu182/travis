import { db } from './client.js';
import { groups, users, messages, queryLogs } from './schema.js';
import { eq, and, desc, sql } from 'drizzle-orm';
import type { NewGroup, NewUser, NewMessage, NewQueryLog } from './schema.js';

// ==================== GROUP OPERATIONS ====================

export async function upsertGroup(data: {
  platform: 'telegram' | 'lark';
  platformGroupId: string;
  name?: string;
  metadata?: Record<string, unknown>;
}) {
  const result = await db
    .insert(groups)
    .values({
      platform: data.platform,
      platformGroupId: data.platformGroupId,
      name: data.name,
      metadata: data.metadata,
    })
    .onConflictDoUpdate({
      target: [groups.platform, groups.platformGroupId],
      set: {
        name: sql`COALESCE(EXCLUDED.name, ${groups.name})`,
        metadata: sql`COALESCE(EXCLUDED.metadata, ${groups.metadata})`,
        updatedAt: new Date(),
      },
    })
    .returning();

  return result[0];
}

export async function getGroupByPlatformId(platform: 'telegram' | 'lark', platformGroupId: string) {
  const result = await db
    .select()
    .from(groups)
    .where(and(eq(groups.platform, platform), eq(groups.platformGroupId, platformGroupId)))
    .limit(1);

  return result[0] || null;
}

// ==================== USER OPERATIONS ====================

export async function upsertUser(data: {
  platform: 'telegram' | 'lark';
  platformUserId: string;
  username?: string;
  displayName?: string;
  metadata?: Record<string, unknown>;
}) {
  const result = await db
    .insert(users)
    .values({
      platform: data.platform,
      platformUserId: data.platformUserId,
      username: data.username,
      displayName: data.displayName,
      metadata: data.metadata,
    })
    .onConflictDoUpdate({
      target: [users.platform, users.platformUserId],
      set: {
        username: sql`COALESCE(EXCLUDED.username, ${users.username})`,
        displayName: sql`COALESCE(EXCLUDED.display_name, ${users.displayName})`,
        metadata: sql`COALESCE(EXCLUDED.metadata, ${users.metadata})`,
        updatedAt: new Date(),
      },
    })
    .returning();

  return result[0];
}

export async function getUserByPlatformId(platform: 'telegram' | 'lark', platformUserId: string) {
  const result = await db
    .select()
    .from(users)
    .where(and(eq(users.platform, platform), eq(users.platformUserId, platformUserId)))
    .limit(1);

  return result[0] || null;
}

// ==================== MESSAGE OPERATIONS ====================

export async function saveMessage(data: {
  groupId: string;
  userId: string;
  platformMessageId: string;
  content: string;
  replyToMessageId?: string;
  threadId?: string;
  metadata?: Record<string, unknown>;
}) {
  const result = await db
    .insert(messages)
    .values({
      groupId: data.groupId,
      userId: data.userId,
      platformMessageId: data.platformMessageId,
      content: data.content,
      replyToMessageId: data.replyToMessageId,
      threadId: data.threadId,
      metadata: data.metadata,
    })
    .onConflictDoNothing({
      target: [messages.groupId, messages.platformMessageId],
    })
    .returning();

  return result[0] || null;
}

export async function getRecentMessages(groupId: string, limit = 5) {
  return db
    .select({
      id: messages.id,
      platformMessageId: messages.platformMessageId,
      content: messages.content,
      senderName: users.displayName,
      createdAt: messages.createdAt,
    })
    .from(messages)
    .leftJoin(users, eq(messages.userId, users.id))
    .where(eq(messages.groupId, groupId))
    .orderBy(desc(messages.createdAt))
    .limit(limit);
}

// Note: Memory operations handled by mem0 OSS (see @travis/core/memory)

// ==================== QUERY LOG OPERATIONS ====================

export async function saveQueryLog(data: NewQueryLog) {
  const result = await db
    .insert(queryLogs)
    .values(data)
    .returning();

  return result[0];
}

// Note: Vector search handled by mem0 OSS with pgvector
