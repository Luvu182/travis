import { Hono } from 'hono';
import {
  getProcessingMetrics,
  resetProcessingMetrics,
  getWorkspaceMetrics,
  getAllWorkspaceMetrics,
  resetWorkspaceMetrics,
  resetAllWorkspaceMetrics,
} from '../services/message-processor.js';

export const metricsRoutes = new Hono();

function calculateDerivedMetrics(metrics: { totalProcessed: number; totalFailed: number; totalRetries: number; avgLatencyMs: number }) {
  return {
    ...metrics,
    successRate:
      metrics.totalProcessed + metrics.totalFailed > 0
        ? (metrics.totalProcessed / (metrics.totalProcessed + metrics.totalFailed)) * 100
        : 0,
    avgRetriesPerMessage:
      metrics.totalProcessed > 0 ? metrics.totalRetries / metrics.totalProcessed : 0,
  };
}

/**
 * GET /metrics
 * Get global processing metrics
 */
metricsRoutes.get('/', (c) => {
  const metrics = getProcessingMetrics();
  return c.json({
    success: true,
    data: calculateDerivedMetrics(metrics),
  });
});

/**
 * GET /metrics/workspaces
 * Get metrics for all workspaces
 */
metricsRoutes.get('/workspaces', (c) => {
  const workspaceMetrics = getAllWorkspaceMetrics();
  return c.json({
    success: true,
    data: workspaceMetrics.map((ws) => ({
      workspaceId: ws.workspaceId,
      ...calculateDerivedMetrics(ws),
    })),
  });
});

/**
 * GET /metrics/workspaces/:id
 * Get metrics for specific workspace
 */
metricsRoutes.get('/workspaces/:id', (c) => {
  const workspaceId = c.req.param('id');
  const metrics = getWorkspaceMetrics(workspaceId);

  if (!metrics) {
    return c.json({ success: true, data: null, message: 'No metrics for this workspace' });
  }

  return c.json({
    success: true,
    data: {
      workspaceId,
      ...calculateDerivedMetrics(metrics),
    },
  });
});

/**
 * POST /metrics/reset
 * Reset global processing metrics
 */
metricsRoutes.post('/reset', (c) => {
  resetProcessingMetrics();
  return c.json({ success: true, message: 'Global metrics reset' });
});

/**
 * POST /metrics/workspaces/:id/reset
 * Reset metrics for specific workspace
 */
metricsRoutes.post('/workspaces/:id/reset', (c) => {
  const workspaceId = c.req.param('id');
  const deleted = resetWorkspaceMetrics(workspaceId);
  return c.json({
    success: true,
    message: deleted ? `Workspace ${workspaceId} metrics reset` : 'No metrics found for workspace',
  });
});

/**
 * POST /metrics/workspaces/reset
 * Reset all workspace metrics
 */
metricsRoutes.post('/workspaces/reset', (c) => {
  resetAllWorkspaceMetrics();
  return c.json({ success: true, message: 'All workspace metrics reset' });
});
