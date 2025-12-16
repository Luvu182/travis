import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { generate, searchRelevantMemories, formatMemoriesForPrompt, type MemoryItem } from '@jarvis/core';
import { saveQueryLog } from '@jarvis/db';

const chatRoutes = new Hono();

// Request validation schema
const chatRequestSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  groupId: z.string().min(1, 'Group ID is required'),
  message: z.string().min(1, 'Message is required'),
  senderName: z.string().optional(),
  groupName: z.string().optional(),
});

/**
 * POST /chat
 * Generate AI response with memory context
 */
chatRoutes.post(
  '/',
  zValidator('json', chatRequestSchema),
  async (c) => {
    const startTime = Date.now();
    const { userId, groupId, message } = c.req.valid('json');

    try {
      // 1. Search for relevant memories
      const memories = await searchRelevantMemories({
        userId,
        groupId,
        query: message,
        limit: 5,
      });

      // 2. Format memories for LLM prompt
      const memoryContext = formatMemoriesForPrompt(memories);

      // 3. Build system prompt with memory context
      const systemPrompt = `Bạn là J.A.R.V.I.S, trợ lý ảo thông minh hỗ trợ tiếng Việt.

**Thông tin đã lưu trữ:**
${memoryContext}

**Hướng dẫn:**
- Sử dụng thông tin đã lưu để đưa ra câu trả lời chính xác
- Nếu không có thông tin liên quan, trả lời dựa trên kiến thức chung
- Trả lời ngắn gọn, súc tích, tự nhiên
- Sử dụng tiếng Việt

`;

      // 4. Generate response using LLM
      const response = await generate({
        task: 'query',
        system: systemPrompt,
        prompt: message,
        temperature: 0.7,
        maxTokens: 500,
      });

      const latencyMs = Date.now() - startTime;

      // 5. Log query for analytics
      await saveQueryLog({
        groupId,
        userId,
        queryText: message,
        responseText: response.text,
        memoriesUsed: memories.map((m) => m.id),
        latencyMs,
      });

      // 6. Return response
      return c.json({
        success: true,
        data: {
          response: response.text,
          model: response.model,
          usedFallback: response.usedFallback,
          memoriesCount: memories.length,
          latencyMs: response.latencyMs,
          memories: memories.map((m: MemoryItem) => ({ id: m.id, memory: m.memory, score: m.score })),
        },
      });
    } catch (error) {
      console.error('[Chat] Error:', error);
      return c.json(
        {
          success: false,
          error: error instanceof Error ? error.message : 'Internal server error',
        },
        500
      );
    }
  }
);

export { chatRoutes };
