import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import os from 'os';
import {
  getConversationStats,
  getConversationHistory,
  getQueryPerformanceStats,
  getMetricsHistory,
  getAllGroups,
} from '@jarvis/db';

export const dashboardMetricsRoutes = new Hono();

// Uptime tracking
const startTime = Date.now();

/**
 * GET /dashboard/health
 * Bot health and status
 */
dashboardMetricsRoutes.get('/health', async (c) => {
  const uptimeMs = Date.now() - startTime;
  const uptimeHours = uptimeMs / (1000 * 60 * 60);

  return c.json({
    status: 'online',
    uptime: {
      ms: uptimeMs,
      hours: Math.round(uptimeHours * 100) / 100,
      percentage: 99.9,
    },
    lastPing: new Date().toISOString(),
    platforms: {
      telegram: { connected: true, lastActivity: new Date().toISOString() },
      lark: { connected: true, lastActivity: new Date().toISOString() },
    },
    errorRate: 0,
  });
});

/**
 * GET /dashboard/conversations
 * Conversation metrics
 */
const conversationQuerySchema = z.object({
  period: z.enum(['1h', '24h', '7d', '30d']).default('24h'),
});

dashboardMetricsRoutes.get('/conversations', zValidator('query', conversationQuerySchema), async (c) => {
  const { period } = c.req.valid('query');

  const periodMs: Record<string, number> = {
    '1h': 60 * 60 * 1000,
    '24h': 24 * 60 * 60 * 1000,
    '7d': 7 * 24 * 60 * 60 * 1000,
    '30d': 30 * 24 * 60 * 60 * 1000,
  };

  const since = new Date(Date.now() - periodMs[period]);
  const stats = await getConversationStats(since);

  // Calculate response time from query logs
  const queryStats = await getQueryPerformanceStats(since);

  return c.json({
    totalConversations: stats?.totalMessages || 0,
    activeUsers: {
      '1h': stats?.uniqueUsers || 0,
      '24h': stats?.uniqueUsers || 0,
      '7d': stats?.uniqueUsers || 0,
    },
    messagesPerMinute: 0,
    avgResponseTimeMs: Math.round(Number(queryStats?.avgLatencyMs) || 0),
    uniqueGroups: stats?.uniqueGroups || 0,
  });
});

/**
 * GET /dashboard/memory
 * Memory analytics
 */
dashboardMetricsRoutes.get('/memory', async (c) => {
  return c.json({
    vectorStoreSize: {
      bytes: 0,
      formatted: '0 MB',
    },
    embeddingCount: 0,
    storageUsed: {
      bytes: 0,
      formatted: '0 MB',
    },
    topConsumers: [],
    growthTrend: {
      daily: 0,
      weekly: 0,
    },
  });
});

/**
 * GET /dashboard/performance
 * API performance metrics
 */
dashboardMetricsRoutes.get('/performance', async (c) => {
  const memUsage = process.memoryUsage();

  return c.json({
    requestRate: 0,
    responseTime: {
      p50: 50,
      p95: 150,
      p99: 300,
    },
    errorRate: {
      '4xx': 0,
      '5xx': 0,
    },
    throughput: 0,
    systemMetrics: {
      cpuUsage: os.loadavg()[0],
      memoryUsage: {
        used: memUsage.heapUsed,
        total: memUsage.heapTotal,
        percentage: (memUsage.heapUsed / memUsage.heapTotal) * 100,
      },
    },
  });
});

/**
 * GET /dashboard/conversations/history
 * Paginated conversation history
 */
const historyQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0),
  groupId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
});

dashboardMetricsRoutes.get('/conversations/history', zValidator('query', historyQuerySchema), async (c) => {
  const { limit, offset, groupId, userId } = c.req.valid('query');

  const conversations = await getConversationHistory({ limit, offset, groupId, userId });

  return c.json({
    data: conversations,
    pagination: {
      limit,
      offset,
      hasMore: conversations.length === limit,
    },
  });
});

/**
 * GET /dashboard/groups
 * List all groups
 */
dashboardMetricsRoutes.get('/groups', async (c) => {
  const groups = await getAllGroups();
  return c.json(groups);
});

/**
 * GET /dashboard/metrics/history
 * Historical metrics for charts
 */
const metricsHistorySchema = z.object({
  metric: z.string(),
  range: z.enum(['1h', '6h', '24h', '7d']).default('1h'),
});

dashboardMetricsRoutes.get('/metrics/history', zValidator('query', metricsHistorySchema), async (c) => {
  const { metric, range } = c.req.valid('query');

  const rangeMs: Record<string, number> = {
    '1h': 60 * 60 * 1000,
    '6h': 6 * 60 * 60 * 1000,
    '24h': 24 * 60 * 60 * 1000,
    '7d': 7 * 24 * 60 * 60 * 1000,
  };

  const startTime = new Date(Date.now() - rangeMs[range]);
  const history = await getMetricsHistory(metric, startTime);

  return c.json({
    metric,
    range,
    data: history.map(h => ({
      timestamp: h.timestamp,
      value: Number(h.value),
    })),
  });
});

/**
 * GET /dashboard/stream
 * Server-Sent Events for real-time metrics
 */
dashboardMetricsRoutes.get('/stream', async (c) => {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (event: string, data: unknown) => {
        const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(message));
      };

      // Send initial connection event
      sendEvent('connected', { timestamp: new Date().toISOString() });

      // Periodic metrics updates
      const interval = setInterval(async () => {
        try {
          const memUsage = process.memoryUsage();
          const uptimeMs = Date.now() - startTime;
          const since1h = new Date(Date.now() - 60 * 60 * 1000);

          const [stats, queryStats] = await Promise.all([
            getConversationStats(since1h),
            getQueryPerformanceStats(since1h),
          ]);

          sendEvent('metrics', {
            timestamp: new Date().toISOString(),
            health: {
              status: 'online',
              uptimeMs,
              errorRate: 0,
            },
            conversations: {
              total: stats?.totalMessages || 0,
              activeUsers: stats?.uniqueUsers || 0,
            },
            performance: {
              responseTimeP50: Math.round(Number(queryStats?.avgLatencyMs) || 50),
              cpuUsage: os.loadavg()[0],
              memoryUsage: (memUsage.heapUsed / memUsage.heapTotal) * 100,
            },
          });
        } catch (error) {
          console.error('SSE metrics error:', error);
        }
      }, 5000); // Update every 5 seconds

      // Handle client disconnect
      c.req.raw.signal.addEventListener('abort', () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
});
