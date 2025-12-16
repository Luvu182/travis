/**
 * Workspace Operations - CRUD for multi-tenant workspace management
 * Handles workspaces, bot integrations, and API keys
 */
import { eq, and } from 'drizzle-orm';
import { db } from './client';
import {
  workspaces,
  botIntegrations,
  workspaceApiKeys,
  groups,
  type NewWorkspace,
  type NewBotIntegration,
  type NewWorkspaceApiKey,
} from './schema';

// ==================== WORKSPACE OPERATIONS ====================

/**
 * Create a new workspace for a user
 */
export async function createWorkspace(data: NewWorkspace) {
  const result = await db.insert(workspaces).values(data).returning();
  return result[0];
}

/**
 * Get workspace by ID
 */
export async function getWorkspaceById(id: string) {
  const result = await db
    .select()
    .from(workspaces)
    .where(eq(workspaces.id, id))
    .limit(1);
  return result[0] || null;
}

/**
 * Get workspace by slug
 */
export async function getWorkspaceBySlug(slug: string) {
  const result = await db
    .select()
    .from(workspaces)
    .where(eq(workspaces.slug, slug))
    .limit(1);
  return result[0] || null;
}

/**
 * Get all workspaces for a user
 */
export async function getWorkspacesByOwner(ownerId: string) {
  return db
    .select()
    .from(workspaces)
    .where(eq(workspaces.ownerId, ownerId))
    .orderBy(workspaces.createdAt);
}

/**
 * Update workspace
 */
export async function updateWorkspace(
  id: string,
  data: Partial<NewWorkspace>
) {
  const result = await db
    .update(workspaces)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(workspaces.id, id))
    .returning();
  return result[0] || null;
}

/**
 * Delete workspace (cascades to bot_integrations, api_keys, groups)
 */
export async function deleteWorkspace(id: string) {
  await db.delete(workspaces).where(eq(workspaces.id, id));
}

// ==================== BOT INTEGRATION OPERATIONS ====================

/**
 * Add bot integration to workspace
 */
export async function createBotIntegration(data: NewBotIntegration) {
  const result = await db.insert(botIntegrations).values(data).returning();
  return result[0];
}

/**
 * Get bot integration by ID
 */
export async function getBotIntegrationById(id: string) {
  const result = await db
    .select()
    .from(botIntegrations)
    .where(eq(botIntegrations.id, id))
    .limit(1);
  return result[0] || null;
}

/**
 * Get all bot integrations for a workspace
 */
export async function getBotIntegrationsByWorkspace(workspaceId: string) {
  return db
    .select()
    .from(botIntegrations)
    .where(eq(botIntegrations.workspaceId, workspaceId))
    .orderBy(botIntegrations.createdAt);
}

/**
 * Find workspace by bot token (for webhook routing)
 */
export async function getWorkspaceByBotToken(botToken: string) {
  const result = await db
    .select({
      workspace: workspaces,
      bot: botIntegrations,
    })
    .from(botIntegrations)
    .innerJoin(workspaces, eq(botIntegrations.workspaceId, workspaces.id))
    .where(
      and(
        eq(botIntegrations.botToken, botToken),
        eq(botIntegrations.isActive, true),
        eq(workspaces.isActive, true)
      )
    )
    .limit(1);
  return result[0] || null;
}

/**
 * Find workspace by Lark app ID (for webhook routing)
 */
export async function getWorkspaceByLarkAppId(appId: string) {
  const result = await db
    .select({
      workspace: workspaces,
      bot: botIntegrations,
    })
    .from(botIntegrations)
    .innerJoin(workspaces, eq(botIntegrations.workspaceId, workspaces.id))
    .where(
      and(
        eq(botIntegrations.appId, appId),
        eq(botIntegrations.isActive, true),
        eq(workspaces.isActive, true)
      )
    )
    .limit(1);
  return result[0] || null;
}

/**
 * Update bot integration
 */
export async function updateBotIntegration(
  id: string,
  data: Partial<NewBotIntegration>
) {
  const result = await db
    .update(botIntegrations)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(botIntegrations.id, id))
    .returning();
  return result[0] || null;
}

/**
 * Update bot last activity timestamp
 */
export async function updateBotLastActivity(id: string) {
  await db
    .update(botIntegrations)
    .set({ lastActivityAt: new Date() })
    .where(eq(botIntegrations.id, id));
}

/**
 * Delete bot integration
 */
export async function deleteBotIntegration(id: string) {
  await db.delete(botIntegrations).where(eq(botIntegrations.id, id));
}

// ==================== API KEY OPERATIONS ====================

/**
 * Add or update API key for workspace
 */
export async function upsertWorkspaceApiKey(data: NewWorkspaceApiKey) {
  const result = await db
    .insert(workspaceApiKeys)
    .values(data)
    .onConflictDoUpdate({
      target: [workspaceApiKeys.workspaceId, workspaceApiKeys.provider],
      set: {
        apiKey: data.apiKey,
        isActive: data.isActive ?? true,
        updatedAt: new Date(),
      },
    })
    .returning();
  return result[0];
}

/**
 * Get API key for workspace by provider
 */
export async function getWorkspaceApiKey(
  workspaceId: string,
  provider: 'gemini' | 'openai' | 'anthropic'
) {
  const result = await db
    .select()
    .from(workspaceApiKeys)
    .where(
      and(
        eq(workspaceApiKeys.workspaceId, workspaceId),
        eq(workspaceApiKeys.provider, provider),
        eq(workspaceApiKeys.isActive, true)
      )
    )
    .limit(1);
  return result[0] || null;
}

/**
 * Get all API keys for workspace
 */
export async function getWorkspaceApiKeys(workspaceId: string) {
  return db
    .select()
    .from(workspaceApiKeys)
    .where(eq(workspaceApiKeys.workspaceId, workspaceId));
}

/**
 * Update API key last used timestamp
 */
export async function updateApiKeyLastUsed(id: string) {
  await db
    .update(workspaceApiKeys)
    .set({ lastUsedAt: new Date() })
    .where(eq(workspaceApiKeys.id, id));
}

/**
 * Delete API key
 */
export async function deleteWorkspaceApiKey(id: string) {
  await db.delete(workspaceApiKeys).where(eq(workspaceApiKeys.id, id));
}

// ==================== GROUP OPERATIONS (workspace-scoped) ====================

/**
 * Get groups for a workspace
 */
export async function getGroupsByWorkspace(workspaceId: string) {
  return db
    .select()
    .from(groups)
    .where(eq(groups.workspaceId, workspaceId))
    .orderBy(groups.createdAt);
}

/**
 * Link existing group to workspace
 */
export async function linkGroupToWorkspace(groupId: string, workspaceId: string) {
  const result = await db
    .update(groups)
    .set({ workspaceId })
    .where(eq(groups.id, groupId))
    .returning();
  return result[0] || null;
}
