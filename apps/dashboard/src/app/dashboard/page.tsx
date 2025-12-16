'use client';

import { useEffect } from 'react';
import { Card, Badge, Icon, StatCard } from '@/components/ui';
import { LineChart } from '@/components/dashboard/charts/line-chart';
import { useMetricsStore } from '@/stores/metrics';
import { dashboardAPI } from '@/lib/api';
import { useSSE } from '@/hooks/use-sse';

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
  const { isConnected } = useSSE(`${API_URL}/api/dashboard/stream`, {
    onMetrics: (metrics) => {
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

      addLatencyPoint(metrics.performance.responseTimeP50);
      addRequestRatePoint(metrics.performance.cpuUsage);
    },
  });

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
      {/* Status Badges */}
      <div className="flex items-center gap-3 flex-wrap">
        <Badge
          variant={health?.status === 'online' ? 'success' : 'danger'}
          dot
          icon={<Icon name="wifi" size="xs" />}
        >
          {health?.status || 'Loading...'}
        </Badge>

        <Badge
          variant={isConnected ? 'info' : 'default'}
          dot
          icon={<Icon name="radio" size="xs" className={isConnected ? 'animate-pulse' : ''} />}
        >
          {isConnected ? 'Live' : 'Polling'}
        </Badge>

        {health && health.errorRate > 0 && (
          <Badge variant="danger" icon={<Icon name="alert-triangle" size="xs" />}>
            {health.errorRate}% Error Rate
          </Badge>
        )}
      </div>

      {/* Metric Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Uptime"
          value={`${health?.uptime?.percentage || 0}%`}
          suffix={`${health?.uptime?.hours || 0}h`}
          icon="clock"
        />
        <StatCard
          label="Tổng Cuộc Trò Chuyện"
          value={conversations?.totalConversations || 0}
          suffix="24h"
          icon="message"
        />
        <StatCard
          label="Người Dùng Hoạt Động"
          value={conversations?.activeUsers?.['24h'] || 0}
          suffix={`${conversations?.activeUsers?.['1h'] || 0}/h`}
          icon="users"
        />
        <StatCard
          label="Thời Gian Phản Hồi"
          value={`${conversations?.avgResponseTimeMs || 0}ms`}
          suffix={`${performance?.throughput || 0} req/min`}
          icon="gauge"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card variant="default">
          <h3 className="text-base font-semibold text-neutral-900 mb-4">Request Rate</h3>
          <LineChart data={requestRateHistory} label="Requests/sec" color="hsl(220, 70%, 50%)" fill />
        </Card>

        <Card variant="default">
          <h3 className="text-base font-semibold text-neutral-900 mb-4">Response Latency</h3>
          <LineChart data={latencyHistory} label="Latency (ms)" color="hsl(160, 60%, 45%)" />
        </Card>
      </div>

      {/* Platform Status */}
      <Card variant="default">
        <h3 className="text-base font-semibold text-neutral-900 mb-4">Trạng Thái Nền Tảng</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {health?.platforms &&
            Object.entries(health.platforms).map(([platform, status]) => (
              <div
                key={platform}
                className="flex items-center justify-between p-4 rounded-xl bg-neutral-50 border border-neutral-100"
              >
                <div>
                  <p className="font-medium text-neutral-900 capitalize">{platform}</p>
                  <p className="text-xs text-neutral-500">
                    Hoạt động lần cuối: {new Date(status.lastActivity).toLocaleTimeString('vi-VN')}
                  </p>
                </div>
                <Badge variant={status.connected ? 'success' : 'danger'} size="sm" dot>
                  {status.connected ? 'Kết nối' : 'Mất kết nối'}
                </Badge>
              </div>
            ))}
          {(!health?.platforms || Object.keys(health.platforms).length === 0) && (
            <div className="col-span-2 text-center py-8 text-neutral-500">
              Chưa có nền tảng nào được kết nối
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
