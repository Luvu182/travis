import { Hono } from 'hono';
import { Bot, webhookCallback } from 'grammy';
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

// Legacy fallback: global bot token from ENV (for backward compatibility)
const LEGACY_TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';

// ==================== BOT INSTANCE CACHE ====================

// Cache bot instances by bot integration ID to avoid recreating on every request
const botCache = new Map<string, Bot>();

/**
 * Get or create a grammY Bot instance for a bot integration
 */
function getBotInstance(botIntegrationId: string, botToken: string): Bot {
  let bot = botCache.get(botIntegrationId);
  if (!bot) {
    bot = new Bot(botToken);

    // Setup error handler
    bot.catch((err) => {
      console.error(`[Telegram] Bot ${botIntegrationId} error:`, err);
    });

    botCache.set(botIntegrationId, bot);
  }
  return bot;
}

/**
 * Clear bot from cache (used when token changes or bot is deleted)
 */
export function clearBotCache(botIntegrationId: string): void {
  botCache.delete(botIntegrationId);
}

// ==================== LEGACY BOT SETUP ====================

// Legacy global bot for backward compatibility
let legacyBot: Bot | null = null;

if (LEGACY_TELEGRAM_BOT_TOKEN) {
  legacyBot = new Bot(LEGACY_TELEGRAM_BOT_TOKEN);

  legacyBot.on('message:text', async (ctx) => {
    try {
      await handleTelegramMessage(ctx, null, null);
    } catch (error) {
      console.error('[Telegram/Legacy] Message handler error:', error);
      try {
        await ctx.reply('Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.');
      } catch (replyError) {
        console.error('[Telegram/Legacy] Failed to send error message:', replyError);
      }
    }
  });

  legacyBot.catch((err) => {
    console.error('[Telegram/Legacy] Bot error:', err);
  });
}

// ==================== MESSAGE HANDLER ====================

/**
 * Handle incoming Telegram message
 * Works for both multi-tenant and legacy single-tenant mode
 */
async function handleTelegramMessage(
  ctx: any,
  workspaceId: string | null,
  botIntegrationId: string | null
) {
  const message = ctx.message;
  const chatId = String(message.chat.id);
  const platformUserId = String(message.from.id);
  const text = message.text;

  // Skip if no text content
  if (!text || text.trim().length === 0) {
    return;
  }

  // 1. Sync user to database
  const user = await upsertUser({
    platform: 'telegram',
    platformUserId,
    username: message.from.username,
    displayName: message.from.first_name || message.from.username || 'Unknown',
    metadata: {
      lastName: message.from.last_name,
      languageCode: message.from.language_code,
    },
  });

  // 2. Sync group/chat to database (with workspace link if available)
  const group = await upsertGroup({
    platform: 'telegram',
    platformGroupId: chatId,
    workspaceId: workspaceId || undefined,
    name: message.chat.title || (message.chat.type === 'private' ? 'Direct Message' : undefined),
    metadata: {
      type: message.chat.type,
    },
  });

  // 3. Save raw message to database
  await saveMessage({
    groupId: group.id,
    userId: user.id,
    platformMessageId: String(message.message_id),
    content: text,
    replyToMessageId: message.reply_to_message?.message_id
      ? String(message.reply_to_message.message_id)
      : undefined,
    threadId: message.message_thread_id ? String(message.message_thread_id) : undefined,
    metadata: {
      date: message.date,
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

  // 5. Send response back to Telegram
  if (result.success && result.responseText) {
    await ctx.reply(result.responseText, {
      reply_parameters: { message_id: message.message_id },
    });
  } else {
    throw new Error(result.error || 'Processing failed');
  }

  // 6. Update bot last activity (for multi-tenant)
  if (botIntegrationId) {
    await updateBotLastActivity(botIntegrationId).catch((err) =>
      console.error('[Telegram] Failed to update bot activity:', err)
    );
  }
}

// ==================== WEBHOOK ROUTE ====================

export const telegramWebhook = new Hono();

/**
 * Multi-tenant webhook endpoint
 * Each bot integration has its own unique webhook URL
 * URL format: /webhook/telegram/:botId
 */
telegramWebhook.post('/:botId', async (c) => {
  const botId = c.req.param('botId');

  try {
    // 1. Look up bot integration from database
    const botIntegration = await getBotIntegrationById(botId);

    if (!botIntegration || !botIntegration.isActive) {
      return c.json({ error: 'Bot not found or inactive' }, 404);
    }

    if (botIntegration.platform !== 'telegram' || !botIntegration.botToken) {
      return c.json({ error: 'Invalid bot configuration' }, 400);
    }

    // 2. Decrypt bot token
    const botToken = decrypt(botIntegration.botToken);

    // 3. Get or create bot instance
    const bot = getBotInstance(botId, botToken);

    // 4. Register message handler for this request
    // Note: grammY handlers are stateless, so we need to set context via middleware
    const workspaceId = botIntegration.workspaceId;

    // Remove any existing handlers and add new one with context
    bot.on('message:text', async (ctx) => {
      try {
        await handleTelegramMessage(ctx, workspaceId, botId);
      } catch (error) {
        console.error(`[Telegram/${botId}] Message handler error:`, error);
        try {
          await ctx.reply('Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.');
        } catch (replyError) {
          console.error(`[Telegram/${botId}] Failed to send error message:`, replyError);
        }
      }
    });

    // 5. Process webhook
    const handler = webhookCallback(bot, 'hono');
    return handler(c);
  } catch (error) {
    console.error(`[Telegram/${botId}] Webhook error:`, error);
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
 * Uses global TELEGRAM_BOT_TOKEN from environment
 */
telegramWebhook.post('/', async (c) => {
  if (!legacyBot) {
    return c.json({ error: 'Telegram bot not configured' }, 503);
  }

  const handler = webhookCallback(legacyBot, 'hono');
  return handler(c);
});

/**
 * Health check for multi-tenant bot
 */
telegramWebhook.get('/:botId', async (c) => {
  const botId = c.req.param('botId');

  try {
    const botIntegration = await getBotIntegrationById(botId);

    return c.json({
      status: botIntegration?.isActive ? 'ok' : 'not_found',
      platform: 'telegram',
      botId,
      workspaceId: botIntegration?.workspaceId || null,
    });
  } catch {
    return c.json({ status: 'error', platform: 'telegram', botId }, 500);
  }
});

/**
 * Legacy health check
 */
telegramWebhook.get('/', (c) => {
  return c.json({
    status: legacyBot ? 'ok' : 'not_configured',
    platform: 'telegram',
    mode: 'legacy',
  });
});
