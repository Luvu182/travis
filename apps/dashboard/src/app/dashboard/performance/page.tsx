'use client';

import { useEffect, useState } from 'react';
import { MetricCard } from '@/components/dashboard/metric-card';
import { dashboardAPI } from '@/lib/api';

export default function PerformancePage() {
  const [performance, setPerformance] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await dashboardAPI.getPerformance();
        setPerformance(data);
      } catch (error) {
        console.error('Failed to fetch performance:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Performance Metrics</h2>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Request Rate"
          value={`${performance?.requestRate || 0}/s`}
          isLoading={isLoading}
        />
        <MetricCard
          title="P50 Latency"
          value={`${performance?.responseTime?.p50 || 0}ms`}
          isLoading={isLoading}
        />
        <MetricCard
          title="P95 Latency"
          value={`${performance?.responseTime?.p95 || 0}ms`}
          isLoading={isLoading}
        />
        <MetricCard
          title="P99 Latency"
          value={`${performance?.responseTime?.p99 || 0}ms`}
          isLoading={isLoading}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <h3 className="text-base font-semibold mb-4">Error Rates</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>4xx Errors</span>
              <span className="text-amber-500 font-medium">
                {performance?.errorRate?.['4xx'] || 0}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>5xx Errors</span>
              <span className="text-red-500 font-medium">
                {performance?.errorRate?.['5xx'] || 0}%
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <h3 className="text-base font-semibold mb-4">System Resources</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>CPU Load</span>
              <span className="font-medium">
                {performance?.systemMetrics?.cpuUsage?.toFixed(2) || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Memory Usage</span>
              <span className="font-medium">
                {performance?.systemMetrics?.memoryUsage?.percentage?.toFixed(1) || 0}%
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary rounded-full h-2 transition-all"
                style={{
                  width: `${performance?.systemMetrics?.memoryUsage?.percentage || 0}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-4 shadow-sm">
        <h3 className="text-base font-semibold mb-4">Throughput</h3>
        <div className="text-4xl font-bold text-primary">
          {performance?.throughput || 0}
          <span className="text-lg font-normal text-muted-foreground ml-2">
            requests/min
          </span>
        </div>
      </div>
    </div>
  );
}
