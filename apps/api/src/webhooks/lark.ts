import { Hono } from 'hono';
import * as lark from '@larksuiteoapi/node-sdk';
import { upsertUser, upsertGroup, saveMessage } from '@jarvis/db';
import { processMessage } from '../services/message-processor.js';

// ==================== CONFIG ====================

const LARK_APP_ID = process.env.LARK_APP_ID || '';
const LARK_APP_SECRET = process.env.LARK_APP_SECRET || '';
const LARK_VERIFICATION_TOKEN = process.env.LARK_VERIFICATION_TOKEN || '';
const LARK_ENCRYPT_KEY = process.env.LARK_ENCRYPT_KEY || '';

if (!LARK_APP_ID || !LARK_APP_SECRET) {
  console.warn('[Lark] App credentials not configured - webhook will be disabled');
}

// ==================== LARK CLIENT ====================

const larkClient = new lark.Client({
  appId: LARK_APP_ID,
  appSecret: LARK_APP_SECRET,
  appType: lark.AppType.SelfBuild,
  domain: lark.Domain.Feishu, // Use Feishu for China, Lark for international
});

// ==================== EVENT DISPATCHER ====================

const eventDispatcher = new lark.EventDispatcher({
  verificationToken: LARK_VERIFICATION_TOKEN,
  encryptKey: LARK_ENCRYPT_KEY,
}).register({
  'im.message.receive_v1': async (data) => {
    try {
      const eventData = data as any;
      const message = eventData.message;
      const sender = eventData.sender;

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
      const userId = sender.sender_id.user_id;
      const messageId = message.message_id;

      // 1. Sync user to database
      const user = await upsertUser({
        platform: 'lark',
        platformUserId: userId,
        username: sender.sender_id.open_id,
        displayName: sender.sender_id.user_id, // Will be updated when fetching user info
        metadata: {
          senderId: sender.sender_id,
          senderType: sender.sender_type,
        },
      });

      // 2. Sync group/chat to database
      const group = await upsertGroup({
        platform: 'lark',
        platformGroupId: chatId,
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

      // 5. Send response back to Lark
      if (result.success && result.responseText) {
        await larkClient.im.message.create({
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
    } catch (error) {
      console.error('[Lark] Message handler error:', error);

      // Try to send error message
      try {
        const eventData = data as any;
        const chatId = eventData.message?.chat_id;

        if (chatId) {
          await larkClient.im.message.create({
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
        }
      } catch (replyError) {
        console.error('[Lark] Failed to send error message:', replyError);
      }
    }
  },
});

// ==================== WEBHOOK ROUTE ====================

export const larkWebhook = new Hono();

// Webhook endpoint for Lark Suite
larkWebhook.post('/', async (c) => {
  if (!LARK_APP_ID || !LARK_APP_SECRET) {
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
    await eventDispatcher.invoke(body);

    return c.json({ success: true });
  } catch (error) {
    console.error('[Lark] Webhook error:', error);
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      500
    );
  }
});

// Health check
larkWebhook.get('/', (c) => {
  return c.json({
    status: LARK_APP_ID && LARK_APP_SECRET ? 'ok' : 'not_configured',
    platform: 'lark',
  });
});
