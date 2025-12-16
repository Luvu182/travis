import { Hono } from 'hono';
import * as lark from '@larksuiteoapi/node-sdk';
import {
  upsertUser,
  upsertGroup,
  saveMessage,
  getBotIntegrationById,
  updateBotLastActivity,
  decrypt,
} from '@jarvis/db';
import { processMessage } from '../services/message-processor.js';

// ==================== CONFIG ====================

// Legacy fallback: global Lark credentials from ENV (for backward compatibility)
const LEGACY_LARK_APP_ID = process.env.LARK_APP_ID || '';
const LEGACY_LARK_APP_SECRET = process.env.LARK_APP_SECRET || '';
const LEGACY_LARK_VERIFICATION_TOKEN = process.env.LARK_VERIFICATION_TOKEN || '';
const LEGACY_LARK_ENCRYPT_KEY = process.env.LARK_ENCRYPT_KEY || '';

// ==================== CLIENT CACHE ====================

// Cache Lark clients and dispatchers by bot integration ID
const clientCache = new Map<string, lark.Client>();
const dispatcherCache = new Map<string, lark.EventDispatcher>();

/**
 * Get or create Lark client for a bot integration
 */
function getLarkClient(
  botIntegrationId: string,
  appId: string,
  appSecret: string
): lark.Client {
  let client = clientCache.get(botIntegrationId);
  if (!client) {
    client = new lark.Client({
      appId,
      appSecret,
      appType: lark.AppType.SelfBuild,
      domain: lark.Domain.Feishu, // Use Feishu for China, Lark for international
    });
    clientCache.set(botIntegrationId, client);
  }
  return client;
}

/**
 * Clear client from cache (used when credentials change or bot is deleted)
 */
export function clearLarkCache(botIntegrationId: string): void {
  clientCache.delete(botIntegrationId);
  dispatcherCache.delete(botIntegrationId);
}

// ==================== LEGACY SETUP ====================

let legacyClient: lark.Client | null = null;
let legacyDispatcher: lark.EventDispatcher | null = null;

if (LEGACY_LARK_APP_ID && LEGACY_LARK_APP_SECRET) {
  legacyClient = new lark.Client({
    appId: LEGACY_LARK_APP_ID,
    appSecret: LEGACY_LARK_APP_SECRET,
    appType: lark.AppType.SelfBuild,
    domain: lark.Domain.Feishu,
  });

  legacyDispatcher = new lark.EventDispatcher({
    verificationToken: LEGACY_LARK_VERIFICATION_TOKEN,
    encryptKey: LEGACY_LARK_ENCRYPT_KEY,
  }).register({
    'im.message.receive_v1': async (data) => {
      try {
        await handleLarkMessage(data, null, null, legacyClient!);
      } catch (error) {
        console.error('[Lark/Legacy] Message handler error:', error);
      }
    },
  });
}

// ==================== MESSAGE HANDLER ====================

/**
 * Handle incoming Lark message
 * Works for both multi-tenant and legacy single-tenant mode
 */
async function handleLarkMessage(
  data: any,
  workspaceId: string | null,
  botIntegrationId: string | null,
  client: lark.Client
) {
  const message = data.message;
  const sender = data.sender;

  // Only handle text messages
  if (message.message_type !== 'text') {
    return;
  }

  // Parse message content (Lark sends JSON-encoded text)
  let text: string;
  try {
    const content = JSON.parse(message.content);
    text = content.text || '';
  } catch {
    console.warn('[Lark] Failed to parse message content:', message.content);
    return;
  }

  if (!text || text.trim().length === 0) {
    return;
  }

  const chatId = message.chat_id;
  const platformUserId = sender.sender_id.user_id;
  const messageId = message.message_id;

  // 1. Sync user to database
  const user = await upsertUser({
    platform: 'lark',
    platformUserId,
    username: sender.sender_id.open_id,
    displayName: sender.sender_id.user_id, // Will be updated when fetching user info
    metadata: {
      senderId: sender.sender_id,
      senderType: sender.sender_type,
    },
  });

  // 2. Sync group/chat to database (with workspace link if available)
  const group = await upsertGroup({
    platform: 'lark',
    platformGroupId: chatId,
    workspaceId: workspaceId || undefined,
    metadata: {
      chatType: message.chat_type,
    },
  });

  // 3. Save raw message to database
  await saveMessage({
    groupId: group.id,
    userId: user.id,
    platformMessageId: messageId,
    content: text,
    replyToMessageId: message.parent_id,
    threadId: message.root_id,
    metadata: {
      createTime: message.create_time,
      messageType: message.message_type,
      botIntegrationId,
    },
  });

  // 4. Process message with retry logic and generate response
  const result = await processMessage({
    userId: user.id,
    groupId: group.id,
    workspaceId: workspaceId || undefined,
    message: text,
    senderName: user.displayName || undefined,
    groupName: group.name || undefined,
  });

  // 5. Send response back to Lark
  if (result.success && result.responseText) {
    await client.im.message.create({
      params: {
        receive_id_type: 'chat_id',
      },
      data: {
        receive_id: chatId,
        msg_type: 'text',
        content: JSON.stringify({
          text: result.responseText,
        }),
      },
    });
  } else {
    throw new Error(result.error || 'Processing failed');
  }

  // 6. Update bot last activity (for multi-tenant)
  if (botIntegrationId) {
    await updateBotLastActivity(botIntegrationId).catch((err) =>
      console.error('[Lark] Failed to update bot activity:', err)
    );
  }
}

/**
 * Send error message to Lark chat
 */
async function sendLarkErrorMessage(client: lark.Client, chatId: string) {
  try {
    await client.im.message.create({
      params: {
        receive_id_type: 'chat_id',
      },
      data: {
        receive_id: chatId,
        msg_type: 'text',
        content: JSON.stringify({
          text: 'Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.',
        }),
      },
    });
  } catch (replyError) {
    console.error('[Lark] Failed to send error message:', replyError);
  }
}

// ==================== WEBHOOK ROUTE ====================

export const larkWebhook = new Hono();

/**
 * Multi-tenant webhook endpoint
 * Each bot integration has its own unique webhook URL
 * URL format: /webhook/lark/:botId
 */
larkWebhook.post('/:botId', async (c) => {
  const botId = c.req.param('botId');

  try {
    // 1. Look up bot integration from database
    const botIntegration = await getBotIntegrationById(botId);

    if (!botIntegration || !botIntegration.isActive) {
      return c.json({ error: 'Bot not found or inactive' }, 404);
    }

    if (
      botIntegration.platform !== 'lark' ||
      !botIntegration.appId ||
      !botIntegration.appSecret
    ) {
      return c.json({ error: 'Invalid bot configuration' }, 400);
    }

    const body = await c.req.json();

    // Handle URL verification challenge
    if (body.type === 'url_verification') {
      return c.json({
        challenge: body.challenge,
      });
    }

    // 2. Decrypt credentials
    const appId = botIntegration.appId;
    const appSecret = decrypt(botIntegration.appSecret);
    const encryptKey = botIntegration.encryptKey ? decrypt(botIntegration.encryptKey) : '';
    const verificationToken = botIntegration.verificationToken || '';

    // 3. Get or create Lark client
    const client = getLarkClient(botId, appId, appSecret);
    const workspaceId = botIntegration.workspaceId;

    // 4. Get or create event dispatcher with context
    let dispatcher = dispatcherCache.get(botId);
    if (!dispatcher) {
      dispatcher = new lark.EventDispatcher({
        verificationToken,
        encryptKey,
      }).register({
        'im.message.receive_v1': async (data) => {
          try {
            await handleLarkMessage(data, workspaceId, botId, client);
          } catch (error) {
            console.error(`[Lark/${botId}] Message handler error:`, error);
            const chatId = (data as any).message?.chat_id;
            if (chatId) {
              await sendLarkErrorMessage(client, chatId);
            }
          }
        },
      });
      dispatcherCache.set(botId, dispatcher);
    }

    // 5. Dispatch event
    await dispatcher.invoke(body);

    return c.json({ success: true });
  } catch (error) {
    console.error(`[Lark/${botId}] Webhook error:`, error);
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      500
    );
  }
});

/**
 * Legacy webhook endpoint (backward compatibility)
 * Uses global LARK_* credentials from environment
 */
larkWebhook.post('/', async (c) => {
  if (!legacyClient || !legacyDispatcher) {
    return c.json({ error: 'Lark bot not configured' }, 503);
  }

  try {
    const body = await c.req.json();

    // Handle URL verification challenge
    if (body.type === 'url_verification') {
      return c.json({
        challenge: body.challenge,
      });
    }

    // Dispatch event to handler
    await legacyDispatcher.invoke(body);

    return c.json({ success: true });
  } catch (error) {
    console.error('[Lark/Legacy] Webhook error:', error);
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      500
    );
  }
});

/**
 * Health check for multi-tenant bot
 */
larkWebhook.get('/:botId', async (c) => {
  const botId = c.req.param('botId');

  try {
    const botIntegration = await getBotIntegrationById(botId);

    return c.json({
      status: botIntegration?.isActive ? 'ok' : 'not_found',
      platform: 'lark',
      botId,
      workspaceId: botIntegration?.workspaceId || null,
    });
  } catch {
    return c.json({ status: 'error', platform: 'lark', botId }, 500);
  }
});

/**
 * Legacy health check
 */
larkWebhook.get('/', (c) => {
  return c.json({
    status: legacyClient ? 'ok' : 'not_configured',
    platform: 'lark',
    mode: 'legacy',
  });
});
