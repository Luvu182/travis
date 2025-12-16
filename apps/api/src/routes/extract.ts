import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { addMemory, storeMessage } from '@jarvis/core';

const extractRoutes = new Hono();

// Request validation schema
const extractRequestSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  groupId: z.string().min(1, 'Group ID is required'),
  message: z.string().min(1, 'Message is required'),
  platformMessageId: z.string().min(1, 'Platform message ID is required'),
  senderName: z.string().optional(),
  groupName: z.string().optional(),
  replyToMessageId: z.string().optional(),
  threadId: z.string().optional(),
});

/**
 * POST /extract
 * Extract information from messages and store in memory
 */
extractRoutes.post(
  '/',
  zValidator('json', extractRequestSchema),
  async (c) => {
    const startTime = Date.now();
    const {
      userId,
      groupId,
      message,
      platformMessageId,
      senderName,
      groupName,
      replyToMessageId,
      threadId,
    } = c.req.valid('json');

    try {
      // 1. Store raw message for audit trail
      await storeMessage({
        platformMessageId,
        groupId,
        userId,
        content: message,
        replyToMessageId,
        threadId,
      });

      // 2. Extract and store information using mem0 (mem0 handles extraction automatically)
      await addMemory({
        userId,
        groupId,
        message,
        senderName,
        groupName,
      });

      const latencyMs = Date.now() - startTime;

      // 3. Return success response
      return c.json({
        success: true,
        data: {
          message: 'Information extracted and stored successfully',
          latencyMs,
        },
      });
    } catch (error) {
      console.error('[Extract] Error:', error);
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

export { extractRoutes };
