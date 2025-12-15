import { db } from './client.js';
import { groups, users, messages, extractedInfo, memories, queryLogs } from './schema.js';
import { eq, and, desc, sql, gt, lt, ilike } from 'drizzle-orm';
import type { NewGroup, NewUser, NewMessage, NewExtractedInfo, NewMemory, NewQueryLog } from './schema.js';

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

// ==================== EXTRACTED INFO OPERATIONS ====================

export async function saveExtractedInfo(data: NewExtractedInfo) {
  const result = await db
    .insert(extractedInfo)
    .values(data)
    .returning();

  return result[0];
}

export async function getExtractedInfoByGroup(
  groupId: string,
  options?: {
    type?: 'task' | 'decision' | 'deadline' | 'important' | 'general';
    status?: string;
    limit?: number;
  }
) {
  const conditions = [eq(extractedInfo.groupId, groupId)];

  if (options?.type) {
    conditions.push(eq(extractedInfo.infoType, options.type));
  }

  if (options?.status) {
    conditions.push(eq(extractedInfo.status, options.status));
  }

  return db
    .select()
    .from(extractedInfo)
    .where(and(...conditions))
    .orderBy(desc(extractedInfo.createdAt))
    .limit(options?.limit || 20);
}

// ==================== MEMORY OPERATIONS ====================

export async function saveMemory(data: NewMemory) {
  const result = await db
    .insert(memories)
    .values(data)
    .returning();

  return result[0];
}

export async function getRecentMemories(groupId: string, limit = 10) {
  return db
    .select()
    .from(memories)
    .where(eq(memories.groupId, groupId))
    .orderBy(desc(memories.createdAt))
    .limit(limit);
}

// ==================== QUERY LOG OPERATIONS ====================

export async function saveQueryLog(data: NewQueryLog) {
  const result = await db
    .insert(queryLogs)
    .values(data)
    .returning();

  return result[0];
}

// ==================== VECTOR SEARCH ====================

export async function searchByVector(
  embedding: number[],
  options: {
    groupId?: string;
    type?: 'task' | 'decision' | 'deadline' | 'important' | 'general';
    limit?: number;
    minSimilarity?: number;
  } = {}
) {
  // Validate embedding dimension (Gemini embedding-001 = 1536D)
  if (!Array.isArray(embedding) || embedding.length !== 1536) {
    throw new Error('Invalid embedding: must be array of 1536 numbers');
  }

  // Validate all elements are numbers
  if (!embedding.every(n => typeof n === 'number' && !isNaN(n))) {
    throw new Error('Invalid embedding: all elements must be valid numbers');
  }

  const { groupId, type, limit = 10, minSimilarity = 0.5 } = options;

  // Convert embedding to PostgreSQL array format safely
  const embeddingStr = `[${embedding.join(',')}]`;

  // Raw SQL for vector similarity search with parameterized embedding
  const result = await db.execute(sql`
    SELECT
      id,
      info_type as type,
      content,
      summary,
      due_date as "dueDate",
      1 - (embedding <=> ${embeddingStr}::vector) as similarity
    FROM extracted_info
    WHERE (${groupId}::uuid IS NULL OR group_id = ${groupId}::uuid)
      AND (${type}::info_type IS NULL OR info_type = ${type}::info_type)
      AND embedding IS NOT NULL
      AND 1 - (embedding <=> ${embeddingStr}::vector) >= ${minSimilarity}
    ORDER BY embedding <=> ${embeddingStr}::vector
    LIMIT ${limit}
  `);

  return result as unknown as any[];
}

export async function searchMemories(
  embedding: number[],
  options: {
    groupId?: string;
    limit?: number;
  } = {}
) {
  // Validate embedding dimension (Gemini embedding-001 = 1536D)
  if (!Array.isArray(embedding) || embedding.length !== 1536) {
    throw new Error('Invalid embedding: must be array of 1536 numbers');
  }

  // Validate all elements are numbers
  if (!embedding.every(n => typeof n === 'number' && !isNaN(n))) {
    throw new Error('Invalid embedding: all elements must be valid numbers');
  }

  const { groupId, limit = 10 } = options;

  // Convert embedding to PostgreSQL array format safely
  const embeddingStr = `[${embedding.join(',')}]`;

  const result = await db.execute(sql`
    SELECT
      id,
      content,
      memory_type as type,
      1 - (embedding <=> ${embeddingStr}::vector) as similarity
    FROM memories
    WHERE (${groupId}::uuid IS NULL OR group_id = ${groupId}::uuid)
      AND embedding IS NOT NULL
    ORDER BY embedding <=> ${embeddingStr}::vector
    LIMIT ${limit}
  `);

  return result as unknown as any[];
}

// ==================== ANALYTICS ====================

export async function getGroupStats(groupId: string) {
  const result = await db.execute(sql`
    SELECT
      (SELECT COUNT(*) FROM messages WHERE group_id = ${groupId}::uuid) as total_messages,
      (SELECT COUNT(*) FROM extracted_info WHERE group_id = ${groupId}::uuid AND info_type = 'task') as total_tasks,
      (SELECT COUNT(*) FROM extracted_info WHERE group_id = ${groupId}::uuid AND info_type = 'decision') as total_decisions,
      (SELECT COUNT(*) FROM extracted_info WHERE group_id = ${groupId}::uuid AND info_type = 'deadline') as total_deadlines,
      (SELECT COUNT(*) FROM memories WHERE group_id = ${groupId}::uuid) as total_memories
  `) as unknown as { rows: Record<string, string>[] };

  const row = result.rows[0];
  return {
    totalMessages: Number(row.total_messages),
    totalTasks: Number(row.total_tasks),
    totalDecisions: Number(row.total_decisions),
    totalDeadlines: Number(row.total_deadlines),
    totalMemories: Number(row.total_memories),
  };
}
