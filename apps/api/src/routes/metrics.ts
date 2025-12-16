import { Hono } from 'hono';
import { getProcessingMetrics, resetProcessingMetrics } from '../services/message-processor.js';

export const metricsRoutes = new Hono();

/**
 * GET /metrics
 * Get message processing metrics
 */
metricsRoutes.get('/', (c) => {
  const metrics = getProcessingMetrics();

  return c.json({
    success: true,
    data: {
      ...metrics,
      successRate:
        metrics.totalProcessed + metrics.totalFailed > 0
          ? (metrics.totalProcessed / (metrics.totalProcessed + metrics.totalFailed)) * 100
          : 0,
      avgRetriesPerMessage:
        metrics.totalProcessed > 0 ? metrics.totalRetries / metrics.totalProcessed : 0,
    },
  });
});

/**
 * POST /metrics/reset
 * Reset processing metrics
 */
metricsRoutes.post('/reset', (c) => {
  resetProcessingMetrics();

  return c.json({
    success: true,
    message: 'Metrics reset successfully',
  });
});
