import { Hono } from 'hono';
import { Bot, webhookCallback } from 'grammy';
import { upsertUser, upsertGroup, saveMessage } from '@jarvis/db';
import { processMessage } from '../services/message-processor.js';

// ==================== CONFIG ====================

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';

if (!TELEGRAM_BOT_TOKEN) {
  console.warn('[Telegram] BOT_TOKEN not configured - webhook will be disabled');
}

// ==================== BOT SETUP ====================

const bot = new Bot(TELEGRAM_BOT_TOKEN);

// ==================== MESSAGE HANDLER ====================

bot.on('message:text', async (ctx) => {
  try {
    const message = ctx.message;
    const chatId = String(message.chat.id);
    const userId = String(message.from.id);
    const text = message.text;

    // Skip if no text content
    if (!text || text.trim().length === 0) {
      return;
    }

    // 1. Sync user to database
    const user = await upsertUser({
      platform: 'telegram',
      platformUserId: userId,
      username: message.from.username,
      displayName: message.from.first_name || message.from.username || 'Unknown',
      metadata: {
        lastName: message.from.last_name,
        languageCode: message.from.language_code,
      },
    });

    // 2. Sync group/chat to database
    const group = await upsertGroup({
      platform: 'telegram',
      platformGroupId: chatId,
      name: message.chat.title || message.chat.type === 'private' ? 'Direct Message' : undefined,
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
      },
    });

    // 4. Process message with retry logic and generate response
    const result = await processMessage({
      userId: user.id,
      groupId: group.id,
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
  } catch (error) {
    console.error('[Telegram] Message handler error:', error);

    // Send error message to user
    try {
      await ctx.reply('Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.');
    } catch (replyError) {
      console.error('[Telegram] Failed to send error message:', replyError);
    }
  }
});

// ==================== ERROR HANDLING ====================

bot.catch((err) => {
  console.error('[Telegram] Bot error:', err);
});

// ==================== WEBHOOK ROUTE ====================

export const telegramWebhook = new Hono();

// Webhook endpoint for Telegram
telegramWebhook.post('/', async (c) => {
  if (!TELEGRAM_BOT_TOKEN) {
    return c.json({ error: 'Telegram bot not configured' }, 503);
  }

  // Use grammY's webhook callback with Hono adapter
  const handler = webhookCallback(bot, 'hono');
  return handler(c);
});

// Health check
telegramWebhook.get('/', (c) => {
  return c.json({
    status: TELEGRAM_BOT_TOKEN ? 'ok' : 'not_configured',
    platform: 'telegram',
  });
});
