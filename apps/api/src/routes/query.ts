import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { executeQuery, getMemoryStats } from '../services/query-handler.js';

export const queryRoutes = new Hono();

// Request validation schema
const queryRequestSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  groupId: z.string().min(1, 'Group ID is required'),
  query: z.string().min(1, 'Query is required'),
  limit: z.number().int().min(1).max(20).default(5),
  minScore: z.number().min(0).max(1).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  includeMetadata: z.boolean().default(true),
});

// Stats request schema
const statsRequestSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  groupId: z.string().min(1, 'Group ID is required'),
});

/**
 * POST /query
 * Execute advanced memory query with ranking and filtering
 */
queryRoutes.post('/', zValidator('json', queryRequestSchema), async (c) => {
  const startTime = Date.now();
  const { userId, groupId, query, limit, minScore, dateFrom, dateTo, includeMetadata } =
    c.req.valid('json');

  try {
    const result = await executeQuery({
      userId,
      groupId,
      query,
      limit,
      minScore,
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined,
      includeMetadata,
    });

    const totalLatencyMs = Date.now() - startTime;

    if (!result.success) {
      return c.json(
        {
          success: false,
          error: result.error || 'Query execution failed',
        },
        500
      );
    }

    return c.json({
      success: true,
      data: {
        memories: result.memories.map((m) => ({
          id: m.id,
          memory: m.memory,
          score: m.score,
          rank: m.rank,
          rankingScore: m.rankingScore,
          relevanceReason: m.relevanceReason,
          metadata: includeMetadata ? m.metadata : undefined,
          created_at: m.created_at,
          updated_at: m.updated_at,
        })),
        totalCount: result.totalCount,
        formattedContext: result.formattedContext,
        queryLatencyMs: result.queryLatencyMs,
        totalLatencyMs,
      },
    });
  } catch (error) {
    console.error('[Query] Error:', error);
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
 * POST /query/stats
 * Get memory statistics for a user/group
 */
queryRoutes.post('/stats', zValidator('json', statsRequestSchema), async (c) => {
  const startTime = Date.now();
  const { userId, groupId } = c.req.valid('json');

  try {
    const stats = await getMemoryStats(userId, groupId);
    const latencyMs = Date.now() - startTime;

    return c.json({
      success: true,
      data: {
        ...stats,
        latencyMs,
      },
    });
  } catch (error) {
    console.error('[Query/Stats] Error:', error);
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      500
    );
  }
});
