'use client';

import { useEffect } from 'react';
import {
  Wifi,
  Clock,
  MessageSquare,
  Users,
  Gauge,
  AlertTriangle,
  Radio,
} from 'lucide-react';
import { MetricCard } from '@/components/dashboard/metric-card';
import { LineChart } from '@/components/dashboard/charts/line-chart';
import { useMetricsStore } from '@/stores/metrics';
import { dashboardAPI } from '@/lib/api';
import { useSSE } from '@/hooks/use-sse';
import { cn } from '@/lib/utils';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default function DashboardPage() {
  const {
    health,
    conversations,
    performance,
    requestRateHistory,
    latencyHistory,
    isLoading,
    setHealth,
    setConversations,
    setPerformance,
    addRequestRatePoint,
    addLatencyPoint,
    setLoading,
  } = useMetricsStore();

  // SSE for real-time updates
  const { isConnected } = useSSE(
    `${API_URL}/api/dashboard/stream`,
    {
      onMetrics: (metrics) => {
        // Update health status
        setHealth({
          status: metrics.health.status,
          uptime: {
            ms: metrics.health.uptimeMs,
            hours: Math.round((metrics.health.uptimeMs / (1000 * 60 * 60)) * 100) / 100,
            percentage: 99.9,
          },
          lastPing: metrics.timestamp,
          platforms: health?.platforms || {},
          errorRate: metrics.health.errorRate,
        });

        // Update conversation metrics
        setConversations({
          totalConversations: metrics.conversations.total,
          activeUsers: {
            '1h': metrics.conversations.activeUsers,
            '24h': metrics.conversations.activeUsers,
            '7d': metrics.conversations.activeUsers,
          },
          messagesPerMinute: 0,
          avgResponseTimeMs: metrics.performance.responseTimeP50,
          uniqueGroups: conversations?.uniqueGroups || 0,
        });

        // Update performance and charts
        addLatencyPoint(metrics.performance.responseTimeP50);
        addRequestRatePoint(metrics.performance.cpuUsage);
      },
    }
  );

  // Initial data fetch
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [healthData, convData, perfData] = await Promise.all([
          dashboardAPI.getHealth(),
          dashboardAPI.getConversations(),
          dashboardAPI.getPerformance(),
        ]);
        // Transform API response to store types
        setHealth({
          status: healthData.status as 'online' | 'offline' | 'degraded',
          uptime: {
            ms: healthData.uptimeMs,
            hours: Math.round((healthData.uptimeMs / (1000 * 60 * 60)) * 100) / 100,
            percentage: 99.9,
          },
          lastPing: healthData.lastPing,
          platforms: {},
          errorRate: 0,
        });
        setConversations({
          totalConversations: convData.total,
          activeUsers: {
            '1h': convData.active,
            '24h': convData.active,
            '7d': convData.active,
          },
          messagesPerMinute: convData.messagesPerMin,
          avgResponseTimeMs: perfData.responseTime.p50,
          uniqueGroups: 0,
        });
        setPerformance({
          requestRate: perfData.requestRate,
          responseTime: perfData.responseTime,
          errorRate: perfData.errorRate,
          throughput: perfData.throughput,
          systemMetrics: {
            cpuUsage: perfData.systemMetrics.cpuUsage,
            memoryUsage: {
              used: 0,
              total: 0,
              percentage: perfData.systemMetrics.memoryUsage.percentage,
            },
          },
        });
        addRequestRatePoint(perfData.requestRate);
        addLatencyPoint(perfData.responseTime.p50);
      } catch (error) {
        console.error('Failed to fetch metrics:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Status Banner */}
      <div className="flex items-center gap-2 flex-wrap">
        <span
          className={cn(
            'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
            health?.status === 'online'
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
          )}
        >
          <Wifi className="h-3 w-3 mr-1" />
          {health?.status || 'Loading...'}
        </span>
        <span
          className={cn(
            'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
            isConnected
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
              : 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
          )}
        >
          <Radio className={cn('h-3 w-3 mr-1', isConnected && 'animate-pulse')} />
          {isConnected ? 'Live' : 'Polling'}
        </span>
        {health && health.errorRate > 0 && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
            <AlertTriangle className="h-3 w-3 mr-1" />
            {health.errorRate}% Error Rate
          </span>
        )}
      </div>

      {/* Metric Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Uptime"
          value={`${health?.uptime?.percentage || 0}%`}
          subtitle={`${health?.uptime?.hours || 0} hours`}
          icon={<Clock className="h-5 w-5" />}
          isLoading={isLoading}
        />
        <MetricCard
          title="Total Conversations"
          value={conversations?.totalConversations?.toLocaleString() || '0'}
          subtitle="Last 24 hours"
          icon={<MessageSquare className="h-5 w-5" />}
          isLoading={isLoading}
        />
        <MetricCard
          title="Active Users"
          value={conversations?.activeUsers?.['24h']?.toLocaleString() || '0'}
          subtitle={`${conversations?.activeUsers?.['1h'] || 0} in last hour`}
          icon={<Users className="h-5 w-5" />}
          isLoading={isLoading}
        />
        <MetricCard
          title="Avg Response Time"
          value={`${conversations?.avgResponseTimeMs || 0}ms`}
          subtitle={`${performance?.throughput || 0} req/min`}
          icon={<Gauge className="h-5 w-5" />}
          isLoading={isLoading}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <h3 className="text-base font-semibold mb-4">Request Rate</h3>
          <LineChart
            data={requestRateHistory}
            label="Requests/sec"
            color="hsl(220, 70%, 50%)"
            fill
          />
        </div>

        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <h3 className="text-base font-semibold mb-4">Response Latency</h3>
          <LineChart
            data={latencyHistory}
            label="Latency (ms)"
            color="hsl(160, 60%, 45%)"
          />
        </div>
      </div>

      {/* Platform Status */}
      <div className="rounded-lg border bg-card p-4 shadow-sm">
        <h3 className="text-base font-semibold mb-4">Platform Status</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {health?.platforms &&
            Object.entries(health.platforms).map(([platform, status]) => (
              <div
                key={platform}
                className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
              >
                <div>
                  <p className="font-medium capitalize">{platform}</p>
                  <p className="text-xs text-muted-foreground">
                    Last activity: {new Date(status.lastActivity).toLocaleTimeString()}
                  </p>
                </div>
                <span
                  className={cn(
                    'px-2 py-1 rounded-full text-xs font-medium',
                    status.connected
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  )}
                >
                  {status.connected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
