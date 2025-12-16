'use client';

import { useEffect } from 'react';
import { Card, Badge, Icon, StatCard } from '@/components/ui';
import { LineChart } from '@/components/dashboard/charts/line-chart';
import { useMetricsStore } from '@/stores/metrics';
import { dashboardAPI } from '@/lib/api';
import { useSSE } from '@/hooks/use-sse';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default function AdminDashboardPage() {
  const {
    health,
    conversations,
    performance,
    requestRateHistory,
    latencyHistory,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6 p-6 overflow-auto h-full">
      {/* Page Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">System Overview</h2>
          <p className="text-sm text-neutral-500 mt-1">
            Theo dõi hiệu suất và hoạt động của hệ thống
          </p>
        </div>

        {/* Status Badges */}
        <div className="flex items-center gap-3">
          <Badge variant="warning" size="sm">
            <Icon name="shield" size="xs" className="mr-1" />
            Admin
          </Badge>
          <Badge
            variant={health?.status === 'online' ? 'success' : 'danger'}
            dot
            icon={<Icon name="wifi" size="xs" />}
          >
            {health?.status === 'online' ? 'Hoạt động' : health?.status || 'Đang tải...'}
          </Badge>

          <Badge
            variant={isConnected ? 'info' : 'default'}
            dot
            icon={<Icon name="radio" size="xs" className={isConnected ? 'animate-pulse' : ''} />}
          >
            {isConnected ? 'Real-time' : 'Polling'}
          </Badge>
        </div>
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
          icon="user"
        />
        <StatCard
          label="Thời Gian Phản Hồi"
          value={`${conversations?.avgResponseTimeMs || 0}ms`}
          suffix={`${performance?.throughput || 0} req/min`}
          icon="lightning"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card variant="default">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-neutral-900">Request Rate</h3>
            <Badge variant="primary" size="sm">Live</Badge>
          </div>
          <LineChart data={requestRateHistory} label="Requests/sec" color="hsl(220, 70%, 50%)" fill />
        </Card>

        <Card variant="default">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-neutral-900">Response Latency</h3>
            <Badge variant="success" size="sm">P50</Badge>
          </div>
          <LineChart data={latencyHistory} label="Latency (ms)" color="hsl(160, 60%, 45%)" />
        </Card>
      </div>

      {/* Platform Status */}
      <Card variant="default">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-neutral-900">Trạng Thái Nền Tảng</h3>
          <Badge variant="default" size="sm">
            <Icon name="integration" size="xs" className="mr-1" />
            Tích hợp
          </Badge>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {health?.platforms &&
            Object.entries(health.platforms).map(([platform, status]) => (
              <div
                key={platform}
                className="flex items-center justify-between p-4 rounded-xl bg-neutral-50 border border-neutral-100"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm border border-neutral-100">
                    <Icon
                      name={platform === 'telegram' ? 'telegram' : platform === 'lark' ? 'lark' : 'globe'}
                      size="sm"
                      className="text-neutral-600"
                    />
                  </div>
                  <div>
                    <p className="font-medium text-neutral-900 capitalize">{platform}</p>
                    <p className="text-xs text-neutral-500">
                      Lần cuối: {new Date(status.lastActivity).toLocaleTimeString('vi-VN')}
                    </p>
                  </div>
                </div>
                <Badge variant={status.connected ? 'success' : 'danger'} size="sm" dot>
                  {status.connected ? 'Kết nối' : 'Mất kết nối'}
                </Badge>
              </div>
            ))}
          {(!health?.platforms || Object.keys(health.platforms).length === 0) && (
            <div className="col-span-2 text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto mb-4">
                <Icon name="integration" size="lg" className="text-neutral-400" />
              </div>
              <p className="text-neutral-500 font-medium">Chưa có nền tảng nào được kết nối</p>
              <p className="text-sm text-neutral-400 mt-1">
                Kết nối Telegram hoặc Lark để bắt đầu
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* System Health Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card variant="default">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
              <Icon name="server" size="md" className="text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-neutral-500">CPU Usage</p>
              <p className="text-xl font-bold text-neutral-900">
                {performance?.systemMetrics?.cpuUsage?.toFixed(1) || 0}%
              </p>
            </div>
          </div>
        </Card>

        <Card variant="default">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
              <Icon name="database" size="md" className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Memory Usage</p>
              <p className="text-xl font-bold text-neutral-900">
                {performance?.systemMetrics?.memoryUsage?.percentage?.toFixed(1) || 0}%
              </p>
            </div>
          </div>
        </Card>

        <Card variant="default">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
              <Icon name="lightning" size="md" className="text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Error Rate</p>
              <p className="text-xl font-bold text-neutral-900">
                {performance?.errorRate ? ((performance.errorRate['4xx'] || 0) + (performance.errorRate['5xx'] || 0)).toFixed(2) : 0}%
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
