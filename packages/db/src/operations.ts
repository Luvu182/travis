import { db } from './client';
import { groups, users, messages, queryLogs, adminUsers, refreshTokens, metricsHistory } from './schema';
import { eq, and, desc, sql, isNull, gt, gte, lte, count, avg } from 'drizzle-orm';
import type { NewGroup, NewUser, NewMessage, NewQueryLog } from './schema';
import { hashPassword, verifyPassword, validatePasswordStrength } from './auth-utils';

// ==================== GROUP OPERATIONS ====================

export async function upsertGroup(data: {
  platform: 'telegram' | 'lark';
  platformGroupId: string;
  workspaceId?: string;
  name?: string;
  metadata?: Record<string, unknown>;
}) {
  // For multi-tenant mode with workspace: use workspace + platform + platformGroupId uniqueness
  // This uses the idx_groups_workspace_platform_group unique constraint
  const result = await db
    .insert(groups)
    .values({
      platform: data.platform,
      platformGroupId: data.platformGroupId,
      workspaceId: data.workspaceId,
      name: data.name,
      metadata: data.metadata,
    })
    .onConflictDoUpdate({
      target: [groups.workspaceId, groups.platform, groups.platformGroupId],
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

// Note: Memory operations handled by mem0 OSS (see @jarvis/core/memory)

// ==================== QUERY LOG OPERATIONS ====================

export async function saveQueryLog(data: NewQueryLog) {
  const result = await db
    .insert(queryLogs)
    .values(data)
    .returning();

  return result[0];
}

// Note: Vector search handled by mem0 OSS with pgvector

// ==================== ADMIN AUTH OPERATIONS ====================

export async function getAdminByEmail(email: string) {
  const result = await db
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.email, email.toLowerCase()))
    .limit(1);
  return result[0] || null;
}

export async function getAdminById(id: string) {
  const result = await db
    .select({
      id: adminUsers.id,
      email: adminUsers.email,
      name: adminUsers.name,
      role: adminUsers.role,
      isActive: adminUsers.isActive,
    })
    .from(adminUsers)
    .where(eq(adminUsers.id, id))
    .limit(1);
  return result[0] || null;
}

export async function updateLastLogin(userId: string) {
  await db
    .update(adminUsers)
    .set({ lastLoginAt: new Date() })
    .where(eq(adminUsers.id, userId));
}

export async function createAdminUser(data: {
  email: string;
  password: string;
  name?: string;
  role?: 'admin' | 'user';
}): Promise<{ success: boolean; userId?: string; error?: string }> {
  // Validate password
  const validation = validatePasswordStrength(data.password);
  if (!validation.valid) {
    return { success: false, error: validation.message };
  }

  // Check existing user
  const existing = await getAdminByEmail(data.email);
  if (existing) {
    return { success: false, error: 'Email already registered' };
  }

  // Hash and create
  const passwordHash = await hashPassword(data.password);
  const result = await db
    .insert(adminUsers)
    .values({
      email: data.email.toLowerCase(),
      passwordHash,
      name: data.name,
      role: data.role || 'user',
    })
    .returning({ id: adminUsers.id });

  return { success: true, userId: result[0]?.id };
}

export async function verifyAuthUser(
  email: string,
  password: string
): Promise<{ id: string; email: string; name: string | null; role: 'admin' | 'user'; isActive: boolean } | null> {
  const user = await db
    .select({
      id: adminUsers.id,
      email: adminUsers.email,
      name: adminUsers.name,
      role: adminUsers.role,
      passwordHash: adminUsers.passwordHash,
      isActive: adminUsers.isActive,
    })
    .from(adminUsers)
    .where(eq(adminUsers.email, email.toLowerCase()))
    .limit(1);

  if (!user[0]) return null;
  if (!user[0].isActive) return null;
  if (!user[0].passwordHash) return null;

  const valid = await verifyPassword(password, user[0].passwordHash);
  if (!valid) return null;

  await updateLastLogin(user[0].id);

  return {
    id: user[0].id,
    email: user[0].email,
    name: user[0].name,
    role: user[0].role,
    isActive: user[0].isActive,
  };
}

// ==================== REFRESH TOKEN OPERATIONS ====================

export async function saveRefreshToken(data: {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
}) {
  const result = await db
    .insert(refreshTokens)
    .values(data)
    .returning();
  return result[0];
}

export async function getValidRefreshToken(tokenHash: string) {
  const result = await db
    .select()
    .from(refreshTokens)
    .where(
      and(
        eq(refreshTokens.tokenHash, tokenHash),
        isNull(refreshTokens.revokedAt),
        gt(refreshTokens.expiresAt, new Date())
      )
    )
    .limit(1);
  return result[0] || null;
}

export async function revokeRefreshToken(tokenHash: string) {
  await db
    .update(refreshTokens)
    .set({ revokedAt: new Date() })
    .where(eq(refreshTokens.tokenHash, tokenHash));
}

export async function revokeAllUserTokens(userId: string) {
  await db
    .update(refreshTokens)
    .set({ revokedAt: new Date() })
    .where(
      and(
        eq(refreshTokens.userId, userId),
        isNull(refreshTokens.revokedAt)
      )
    );
}

// ==================== METRICS OPERATIONS ====================

export async function saveMetric(data: {
  metricName: string;
  metricType: string;
  value: number;
  labels?: Record<string, string>;
}) {
  await db.insert(metricsHistory).values({
    metricName: data.metricName,
    metricType: data.metricType,
    value: String(data.value),
    labels: data.labels || {},
  });
}

export async function saveMetricsBatch(metrics: Array<{
  metricName: string;
  metricType: string;
  value: number;
  labels?: Record<string, string>;
}>) {
  if (metrics.length === 0) return;

  await db.insert(metricsHistory).values(
    metrics.map(m => ({
      metricName: m.metricName,
      metricType: m.metricType,
      value: String(m.value),
      labels: m.labels || {},
    }))
  );
}

export async function getMetricsHistory(
  metricName: string,
  startTime: Date,
  endTime: Date = new Date()
) {
  return db
    .select()
    .from(metricsHistory)
    .where(
      and(
        eq(metricsHistory.metricName, metricName),
        gte(metricsHistory.timestamp, startTime),
        lte(metricsHistory.timestamp, endTime)
      )
    )
    .orderBy(metricsHistory.timestamp);
}

export async function cleanupOldMetrics(retentionDays: number = 30) {
  const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
  await db
    .delete(metricsHistory)
    .where(lte(metricsHistory.timestamp, cutoff));
}

// ==================== DASHBOARD ANALYTICS ====================

export async function getConversationStats(since: Date) {
  const result = await db
    .select({
      totalMessages: count(),
      uniqueUsers: sql<number>`COUNT(DISTINCT ${messages.userId})`,
      uniqueGroups: sql<number>`COUNT(DISTINCT ${messages.groupId})`,
    })
    .from(messages)
    .where(gte(messages.createdAt, since));

  return result[0] || { totalMessages: 0, uniqueUsers: 0, uniqueGroups: 0 };
}

export async function getConversationHistory(options: {
  limit?: number;
  offset?: number;
  groupId?: string;
  userId?: string;
}) {
  const { limit = 50, offset = 0, groupId, userId } = options;

  let conditions = [];
  if (groupId) conditions.push(eq(messages.groupId, groupId));
  if (userId) conditions.push(eq(messages.userId, userId));

  const baseQuery = db
    .select({
      id: messages.id,
      content: messages.content,
      createdAt: messages.createdAt,
      groupName: groups.name,
      userName: users.displayName,
      platform: groups.platform,
    })
    .from(messages)
    .leftJoin(groups, eq(messages.groupId, groups.id))
    .leftJoin(users, eq(messages.userId, users.id))
    .orderBy(desc(messages.createdAt))
    .limit(limit)
    .offset(offset);

  if (conditions.length > 0) {
    return baseQuery.where(and(...conditions));
  }
  return baseQuery;
}

export async function getQueryPerformanceStats(since: Date) {
  const result = await db
    .select({
      totalQueries: count(),
      avgLatencyMs: avg(queryLogs.latencyMs),
    })
    .from(queryLogs)
    .where(gte(queryLogs.createdAt, since));

  return result[0] || { totalQueries: 0, avgLatencyMs: 0 };
}

export async function getAllGroups() {
  return db
    .select()
    .from(groups)
    .orderBy(desc(groups.createdAt));
}
