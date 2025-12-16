import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { generate } from '@jarvis/core';

const webChatRoutes = new Hono();

// Request schema for web chat (different from platform chat)
const webChatSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['system', 'user', 'assistant']),
      content: z.string(),
    })
  ),
});

/**
 * POST /chat
 * Web chat endpoint - accepts messages array format
 * Different from /api/chat which is for Telegram/Lark platforms
 */
webChatRoutes.post('/', zValidator('json', webChatSchema), async (c) => {
  const { messages } = c.req.valid('json');

  try {
    // Extract system prompt and user message
    const systemMsg = messages.find((m) => m.role === 'system');
    const userMsgs = messages.filter((m) => m.role === 'user');
    const lastUserMsg = userMsgs[userMsgs.length - 1];

    if (!lastUserMsg) {
      return c.json({ error: 'No user message provided' }, 400);
    }

    // Generate response
    const response = await generate({
      task: 'query',
      system: systemMsg?.content || 'Bạn là Jarvis, trợ lý AI thông minh. Trả lời bằng tiếng Việt.',
      prompt: lastUserMsg.content,
      temperature: 0.7,
      maxTokens: 500,
    });

    return c.json({
      response: response.text,
      model: response.model,
    });
  } catch (error) {
    console.error('[WebChat] Error:', error);
    return c.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      500
    );
  }
});

export { webChatRoutes };
