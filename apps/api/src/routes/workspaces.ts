/**
 * Workspace API Routes
 * CRUD for workspaces, bot integrations, and API keys
 */
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import {
  createWorkspace,
  getWorkspaceById,
  getWorkspaceBySlug,
  getWorkspacesByOwner,
  updateWorkspace,
  deleteWorkspace,
  createBotIntegration,
  getBotIntegrationById,
  getBotIntegrationsByWorkspace,
  updateBotIntegration,
  deleteBotIntegration,
  upsertWorkspaceApiKey,
  getWorkspaceApiKeys,
  deleteWorkspaceApiKey,
  getGroupsByWorkspace,
  encrypt,
  maskSensitive,
} from '@jarvis/db';
import { clearBotCache } from '../webhooks/telegram.js';
import { clearLarkCache } from '../webhooks/lark.js';

// Type for auth context set by dashboard-auth middleware
type AuthVariables = {
  userId: string;
  userEmail: string;
  userRole: string;
};

// ==================== SCHEMAS ====================

const createWorkspaceSchema = z.object({
  name: z.string().min(1).max(255),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  description: z.string().optional(),
});

const updateWorkspaceSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  settings: z.record(z.string(), z.unknown()).optional(),
  isActive: z.boolean().optional(),
});

const createBotSchema = z.object({
  platform: z.enum(['telegram', 'lark']),
  name: z.string().max(255).optional(),
  // Telegram
  botToken: z.string().optional(),
  botUsername: z.string().max(255).optional(),
  webhookSecret: z.string().optional(),
  // Lark
  appId: z.string().max(255).optional(),
  appSecret: z.string().optional(),
  encryptKey: z.string().optional(),
  verificationToken: z.string().optional(),
});

const updateBotSchema = createBotSchema.partial().extend({
  isActive: z.boolean().optional(),
});

const upsertApiKeySchema = z.object({
  provider: z.enum(['gemini', 'openai', 'anthropic']),
  apiKey: z.string().min(1),
});

// ==================== ROUTES ====================

export const workspaceRoutes = new Hono<{ Variables: AuthVariables }>();

// -------------------- WORKSPACE CRUD --------------------

/**
 * POST /workspaces
 * Create a new workspace
 */
workspaceRoutes.post('/', zValidator('json', createWorkspaceSchema), async (c) => {
  // Get user from auth context (set by dashboard-auth middleware)
  const userId = c.get('userId');
  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const data = c.req.valid('json');

  try {
    // Check if slug already exists
    const existing = await getWorkspaceBySlug(data.slug);
    if (existing) {
      return c.json({ error: 'Workspace slug already exists' }, 409);
    }

    const workspace = await createWorkspace({
      ...data,
      ownerId: userId,
    });

    return c.json({ success: true, data: workspace }, 201);
  } catch (error) {
    console.error('[Workspaces] Create error:', error);
    return c.json({ error: 'Failed to create workspace' }, 500);
  }
});

/**
 * GET /workspaces
 * List user's workspaces
 */
workspaceRoutes.get('/', async (c) => {
  const userId = c.get('userId');
  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const workspaces = await getWorkspacesByOwner(userId);
    return c.json({ success: true, data: workspaces });
  } catch (error) {
    console.error('[Workspaces] List error:', error);
    return c.json({ error: 'Failed to list workspaces' }, 500);
  }
});

/**
 * GET /workspaces/:id
 * Get workspace by ID
 */
workspaceRoutes.get('/:id', async (c) => {
  const userId = c.get('userId');
  const workspaceId = c.req.param('id');

  try {
    const workspace = await getWorkspaceById(workspaceId);
    if (!workspace) {
      return c.json({ error: 'Workspace not found' }, 404);
    }

    // Check ownership
    if (workspace.ownerId !== userId) {
      return c.json({ error: 'Forbidden' }, 403);
    }

    return c.json({ success: true, data: workspace });
  } catch (error) {
    console.error('[Workspaces] Get error:', error);
    return c.json({ error: 'Failed to get workspace' }, 500);
  }
});

/**
 * PATCH /workspaces/:id
 * Update workspace
 */
workspaceRoutes.patch('/:id', zValidator('json', updateWorkspaceSchema), async (c) => {
  const userId = c.get('userId');
  const workspaceId = c.req.param('id');
  const data = c.req.valid('json');

  try {
    const workspace = await getWorkspaceById(workspaceId);
    if (!workspace) {
      return c.json({ error: 'Workspace not found' }, 404);
    }

    if (workspace.ownerId !== userId) {
      return c.json({ error: 'Forbidden' }, 403);
    }

    const updated = await updateWorkspace(workspaceId, data);
    return c.json({ success: true, data: updated });
  } catch (error) {
    console.error('[Workspaces] Update error:', error);
    return c.json({ error: 'Failed to update workspace' }, 500);
  }
});

/**
 * DELETE /workspaces/:id
 * Delete workspace
 */
workspaceRoutes.delete('/:id', async (c) => {
  const userId = c.get('userId');
  const workspaceId = c.req.param('id');

  try {
    const workspace = await getWorkspaceById(workspaceId);
    if (!workspace) {
      return c.json({ error: 'Workspace not found' }, 404);
    }

    if (workspace.ownerId !== userId) {
      return c.json({ error: 'Forbidden' }, 403);
    }

    await deleteWorkspace(workspaceId);
    return c.json({ success: true });
  } catch (error) {
    console.error('[Workspaces] Delete error:', error);
    return c.json({ error: 'Failed to delete workspace' }, 500);
  }
});

// -------------------- BOT INTEGRATIONS --------------------

/**
 * POST /workspaces/:id/bots
 * Add bot integration
 */
workspaceRoutes.post('/:id/bots', zValidator('json', createBotSchema), async (c) => {
  const userId = c.get('userId');
  const workspaceId = c.req.param('id');
  const data = c.req.valid('json');

  try {
    const workspace = await getWorkspaceById(workspaceId);
    if (!workspace || workspace.ownerId !== userId) {
      return c.json({ error: 'Workspace not found' }, 404);
    }

    // Encrypt sensitive fields
    const botData = {
      ...data,
      workspaceId,
      botToken: data.botToken ? encrypt(data.botToken) : undefined,
      appSecret: data.appSecret ? encrypt(data.appSecret) : undefined,
      encryptKey: data.encryptKey ? encrypt(data.encryptKey) : undefined,
    };

    const bot = await createBotIntegration(botData);

    // Return without sensitive data
    return c.json({
      success: true,
      data: {
        ...bot,
        botToken: bot.botToken ? maskSensitive(data.botToken || '') : null,
        appSecret: bot.appSecret ? '********' : null,
        encryptKey: bot.encryptKey ? '********' : null,
      },
    }, 201);
  } catch (error) {
    console.error('[Workspaces] Create bot error:', error);
    return c.json({ error: 'Failed to create bot integration' }, 500);
  }
});

/**
 * GET /workspaces/:id/bots
 * List bot integrations
 */
workspaceRoutes.get('/:id/bots', async (c) => {
  const userId = c.get('userId');
  const workspaceId = c.req.param('id');

  try {
    const workspace = await getWorkspaceById(workspaceId);
    if (!workspace || workspace.ownerId !== userId) {
      return c.json({ error: 'Workspace not found' }, 404);
    }

    const bots = await getBotIntegrationsByWorkspace(workspaceId);

    // Mask sensitive data
    const maskedBots = bots.map((bot) => ({
      ...bot,
      botToken: bot.botToken ? '********' : null,
      appSecret: bot.appSecret ? '********' : null,
      encryptKey: bot.encryptKey ? '********' : null,
    }));

    return c.json({ success: true, data: maskedBots });
  } catch (error) {
    console.error('[Workspaces] List bots error:', error);
    return c.json({ error: 'Failed to list bot integrations' }, 500);
  }
});

/**
 * PATCH /workspaces/:id/bots/:botId
 * Update bot integration
 */
workspaceRoutes.patch('/:id/bots/:botId', zValidator('json', updateBotSchema), async (c) => {
  const userId = c.get('userId');
  const workspaceId = c.req.param('id');
  const botId = c.req.param('botId');
  const data = c.req.valid('json');

  try {
    const workspace = await getWorkspaceById(workspaceId);
    if (!workspace || workspace.ownerId !== userId) {
      return c.json({ error: 'Workspace not found' }, 404);
    }

    const bot = await getBotIntegrationById(botId);
    if (!bot || bot.workspaceId !== workspaceId) {
      return c.json({ error: 'Bot not found' }, 404);
    }

    // Encrypt sensitive fields if provided
    const updateData = {
      ...data,
      botToken: data.botToken ? encrypt(data.botToken) : undefined,
      appSecret: data.appSecret ? encrypt(data.appSecret) : undefined,
      encryptKey: data.encryptKey ? encrypt(data.encryptKey) : undefined,
    };

    const updated = await updateBotIntegration(botId, updateData);

    // Clear bot cache when credentials change (forces recreation with new creds)
    if (data.botToken || data.appSecret || data.encryptKey) {
      if (bot.platform === 'telegram') {
        clearBotCache(botId);
      } else if (bot.platform === 'lark') {
        clearLarkCache(botId);
      }
      console.log(`[Workspaces] Cleared ${bot.platform} cache for bot ${botId}`);
    }

    return c.json({
      success: true,
      data: {
        ...updated,
        botToken: updated?.botToken ? '********' : null,
        appSecret: updated?.appSecret ? '********' : null,
        encryptKey: updated?.encryptKey ? '********' : null,
      },
    });
  } catch (error) {
    console.error('[Workspaces] Update bot error:', error);
    return c.json({ error: 'Failed to update bot integration' }, 500);
  }
});

/**
 * DELETE /workspaces/:id/bots/:botId
 * Delete bot integration
 */
workspaceRoutes.delete('/:id/bots/:botId', async (c) => {
  const userId = c.get('userId');
  const workspaceId = c.req.param('id');
  const botId = c.req.param('botId');

  try {
    const workspace = await getWorkspaceById(workspaceId);
    if (!workspace || workspace.ownerId !== userId) {
      return c.json({ error: 'Workspace not found' }, 404);
    }

    const bot = await getBotIntegrationById(botId);
    if (!bot || bot.workspaceId !== workspaceId) {
      return c.json({ error: 'Bot not found' }, 404);
    }

    // Clear bot cache before deleting
    if (bot.platform === 'telegram') {
      clearBotCache(botId);
    } else if (bot.platform === 'lark') {
      clearLarkCache(botId);
    }

    await deleteBotIntegration(botId);
    console.log(`[Workspaces] Deleted ${bot.platform} bot ${botId}`);
    return c.json({ success: true });
  } catch (error) {
    console.error('[Workspaces] Delete bot error:', error);
    return c.json({ error: 'Failed to delete bot integration' }, 500);
  }
});

// -------------------- API KEYS --------------------

/**
 * POST /workspaces/:id/api-keys
 * Add or update API key
 */
workspaceRoutes.post('/:id/api-keys', zValidator('json', upsertApiKeySchema), async (c) => {
  const userId = c.get('userId');
  const workspaceId = c.req.param('id');
  const data = c.req.valid('json');

  try {
    const workspace = await getWorkspaceById(workspaceId);
    if (!workspace || workspace.ownerId !== userId) {
      return c.json({ error: 'Workspace not found' }, 404);
    }

    const apiKey = await upsertWorkspaceApiKey({
      workspaceId,
      provider: data.provider,
      apiKey: encrypt(data.apiKey),
    });

    return c.json({
      success: true,
      data: {
        ...apiKey,
        apiKey: maskSensitive(data.apiKey),
      },
    });
  } catch (error) {
    console.error('[Workspaces] Upsert API key error:', error);
    return c.json({ error: 'Failed to save API key' }, 500);
  }
});

/**
 * GET /workspaces/:id/api-keys
 * List API keys (masked)
 */
workspaceRoutes.get('/:id/api-keys', async (c) => {
  const userId = c.get('userId');
  const workspaceId = c.req.param('id');

  try {
    const workspace = await getWorkspaceById(workspaceId);
    if (!workspace || workspace.ownerId !== userId) {
      return c.json({ error: 'Workspace not found' }, 404);
    }

    const keys = await getWorkspaceApiKeys(workspaceId);

    // Mask API keys
    const maskedKeys = keys.map((key) => ({
      ...key,
      apiKey: '********',
    }));

    return c.json({ success: true, data: maskedKeys });
  } catch (error) {
    console.error('[Workspaces] List API keys error:', error);
    return c.json({ error: 'Failed to list API keys' }, 500);
  }
});

/**
 * DELETE /workspaces/:id/api-keys/:keyId
 * Delete API key
 */
workspaceRoutes.delete('/:id/api-keys/:keyId', async (c) => {
  const userId = c.get('userId');
  const workspaceId = c.req.param('id');
  const keyId = c.req.param('keyId');

  try {
    const workspace = await getWorkspaceById(workspaceId);
    if (!workspace || workspace.ownerId !== userId) {
      return c.json({ error: 'Workspace not found' }, 404);
    }

    await deleteWorkspaceApiKey(keyId);
    return c.json({ success: true });
  } catch (error) {
    console.error('[Workspaces] Delete API key error:', error);
    return c.json({ error: 'Failed to delete API key' }, 500);
  }
});

// -------------------- GROUPS --------------------

/**
 * GET /workspaces/:id/groups
 * List groups in workspace
 */
workspaceRoutes.get('/:id/groups', async (c) => {
  const userId = c.get('userId');
  const workspaceId = c.req.param('id');

  try {
    const workspace = await getWorkspaceById(workspaceId);
    if (!workspace || workspace.ownerId !== userId) {
      return c.json({ error: 'Workspace not found' }, 404);
    }

    const groups = await getGroupsByWorkspace(workspaceId);
    return c.json({ success: true, data: groups });
  } catch (error) {
    console.error('[Workspaces] List groups error:', error);
    return c.json({ error: 'Failed to list groups' }, 500);
  }
});
