import { Hono } from 'hono';
import { streamSSE } from 'hono/streaming';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { generate, stream } from '@jarvis/core';

const webChatRoutes = new Hono();

// Request schema for web chat
const webChatSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['system', 'user', 'assistant']),
      content: z.string(),
    })
  ),
  stream: z.boolean().optional().default(false),
});

/**
 * POST /chat
 * Web chat endpoint with optional streaming
 * - stream: false (default) - returns JSON response
 * - stream: true - returns Server-Sent Events (SSE)
 */
webChatRoutes.post('/', zValidator('json', webChatSchema), async (c) => {
  const { messages, stream: useStream } = c.req.valid('json');

  // Extract system prompt and user message
  const systemMsg = messages.find((m) => m.role === 'system');
  const userMsgs = messages.filter((m) => m.role === 'user');
  const lastUserMsg = userMsgs[userMsgs.length - 1];

  if (!lastUserMsg) {
    return c.json({ error: 'No user message provided' }, 400);
  }

  const systemPrompt = systemMsg?.content || 'Bạn là Jarvis, trợ lý AI thông minh. Trả lời bằng tiếng Việt.';

  // Streaming response
  if (useStream) {
    return streamSSE(c, async (sseStream) => {
      try {
        const textStream = stream({
          task: 'query',
          system: systemPrompt,
          prompt: lastUserMsg.content,
          temperature: 0.7,
          maxTokens: 500,
        });

        for await (const chunk of textStream) {
          await sseStream.writeSSE({
            data: JSON.stringify({ content: chunk }),
          });
        }

        // Send done signal
        await sseStream.writeSSE({
          data: JSON.stringify({ done: true }),
        });
      } catch (error) {
        console.error('[WebChat] Stream error:', error);
        await sseStream.writeSSE({
          data: JSON.stringify({ error: error instanceof Error ? error.message : 'Stream error' }),
        });
      }
    });
  }

  // Non-streaming response
  try {
    const response = await generate({
      task: 'query',
      system: systemPrompt,
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
