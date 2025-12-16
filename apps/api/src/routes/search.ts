import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { searchMemories, getAllMemories, type MemoryItem } from '@jarvis/core';

const searchRoutes = new Hono();

// Request validation schema
const searchRequestSchema = z.object({
  query: z.string().min(1, 'Query is required'),
  userId: z.string().min(1, 'User ID is required'),
  groupId: z.string().min(1, 'Group ID is required'),
  limit: z.number().int().min(1).max(100).default(10),
  offset: z.number().int().min(0).default(0),
});

// Get all memories request schema
const getAllRequestSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  groupId: z.string().min(1, 'Group ID is required'),
  limit: z.number().int().min(1).max(100).default(10),
});

/**
 * POST /search
 * Semantic search for memories using vector similarity
 */
searchRoutes.post(
  '/',
  zValidator('json', searchRequestSchema),
  async (c) => {
    const startTime = Date.now();
    const { query, userId, groupId, limit, offset } = c.req.valid('json');

    try {
      // 1. Perform semantic search with mem0
      const allResults = await searchMemories({
        userId,
        groupId,
        query,
        limit: limit + offset, // Fetch enough for pagination
      });

      // 2. Apply pagination (simple offset-based)
      const paginatedResults = allResults.slice(offset, offset + limit);
      const totalCount = allResults.length;
      const hasMore = totalCount > offset + limit;

      const latencyMs = Date.now() - startTime;

      // 3. Return paginated results
      return c.json({
        success: true,
        data: {
          results: paginatedResults.map((memory: MemoryItem) => ({
            id: memory.id,
            memory: memory.memory,
            score: memory.score,
            metadata: memory.metadata,
            created_at: memory.created_at,
            updated_at: memory.updated_at,
          })),
          total_count: totalCount,
          limit,
          offset,
          has_more: hasMore,
          latencyMs,
        },
      });
    } catch (error) {
      console.error('[Search] Error:', error);
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

/**
 * POST /search/all
 * Get all memories for a user/group (no query filter)
 */
searchRoutes.post(
  '/all',
  zValidator('json', getAllRequestSchema),
  async (c) => {
    const startTime = Date.now();
    const { userId, groupId, limit } = c.req.valid('json');

    try {
      // 1. Get all memories from mem0
      const memories = await getAllMemories({
        userId,
        groupId,
        limit,
      });

      const latencyMs = Date.now() - startTime;

      // 2. Return all memories
      return c.json({
        success: true,
        data: {
          results: memories.map((memory: MemoryItem) => ({
            id: memory.id,
            memory: memory.memory,
            score: memory.score,
            metadata: memory.metadata,
            created_at: memory.created_at,
            updated_at: memory.updated_at,
          })),
          total_count: memories.length,
          limit,
          latencyMs,
        },
      });
    } catch (error) {
      console.error('[Search/All] Error:', error);
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

export { searchRoutes };
