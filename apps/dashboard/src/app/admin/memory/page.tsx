'use client';

import { useEffect, useState } from 'react';
import { Card, StatCard, Badge, Icon } from '@/components/ui';
import { dashboardAPI } from '@/lib/api';

interface MemoryConsumer {
  name: string;
  count: number;
}

interface MemoryData {
  vectorStoreSize: { formatted: string };
  embeddingCount: number;
  storageUsed: { formatted: string };
  growthTrend: { daily: number; weekly: number };
  topConsumers: MemoryConsumer[];
}

export default function AdminMemoryPage() {
  const [memory, setMemory] = useState<MemoryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await dashboardAPI.getMemory();
        setMemory(data);
      } catch (error) {
        console.error('Failed to fetch memory:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6 p-6 overflow-auto h-full">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">System Memory</h2>
          <p className="text-sm text-neutral-500 mt-1">
            Quản lý bộ nhớ dài hạn toàn hệ thống (Admin Only)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="warning" size="sm">
            <Icon name="shield" size="xs" className="mr-1" />
            Admin
          </Badge>
          <Badge variant="success" dot>
            <Icon name="refresh" size="xs" className="mr-1 animate-spin" />
            Tự động cập nhật
          </Badge>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Vector Store Size"
          value={memory?.vectorStoreSize?.formatted || '0 MB'}
          icon="database"
        />
        <StatCard
          label="Embedding Count"
          value={memory?.embeddingCount || 0}
          icon="brain"
        />
        <StatCard
          label="Storage Used"
          value={memory?.storageUsed?.formatted || '0 MB'}
          icon="server"
        />
      </div>

      {/* Growth & Consumers */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card variant="default">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-neutral-900">Xu Hướng Tăng Trưởng</h3>
            <Badge variant="success" size="sm">
              <Icon name="chevron-up" size="xs" className="mr-1" />
              Tích cực
            </Badge>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-neutral-50 border border-neutral-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <Icon name="clock" size="sm" className="text-emerald-600" />
                </div>
                <span className="text-neutral-700 font-medium">Tăng trưởng hàng ngày</span>
              </div>
              <Badge variant="success" size="sm">
                +{memory?.growthTrend?.daily || 0} memories
              </Badge>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-neutral-50 border border-neutral-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Icon name="analytics" size="sm" className="text-blue-600" />
                </div>
                <span className="text-neutral-700 font-medium">Tăng trưởng hàng tuần</span>
              </div>
              <Badge variant="success" size="sm">
                +{memory?.growthTrend?.weekly || 0} memories
              </Badge>
            </div>
          </div>
        </Card>

        <Card variant="default">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-neutral-900">Top Consumers</h3>
            <Badge variant="default" size="sm">
              <Icon name="user" size="xs" className="mr-1" />
              Theo người dùng
            </Badge>
          </div>
          {memory && memory.topConsumers && memory.topConsumers.length > 0 ? (
            <div className="space-y-3">
              {memory.topConsumers.map((consumer: MemoryConsumer, i: number) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 border border-neutral-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                      <span className="text-xs font-medium text-primary-600">
                        {consumer.name[0]?.toUpperCase() || '?'}
                      </span>
                    </div>
                    <span className="truncate max-w-[160px] text-neutral-700 font-medium">{consumer.name}</span>
                  </div>
                  <span className="text-neutral-500 text-sm">{consumer.count} memories</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-xl bg-neutral-100 flex items-center justify-center mx-auto mb-3">
                <Icon name="user" size="md" className="text-neutral-400" />
              </div>
              <p className="text-neutral-500 text-sm">Chưa có dữ liệu</p>
            </div>
          )}
        </Card>
      </div>

      {/* Tech Stack Info */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card variant="default" padding="sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
              <Icon name="database" size="sm" className="text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Vector Database</p>
              <p className="font-semibold text-neutral-900">pgvector</p>
            </div>
          </div>
        </Card>
        <Card variant="default" padding="sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
              <Icon name="sparkles" size="sm" className="text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Embedding Model</p>
              <p className="font-semibold text-neutral-900">Vector Embedding</p>
            </div>
          </div>
        </Card>
        <Card variant="default" padding="sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center">
              <Icon name="memory" size="sm" className="text-teal-600" />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Memory Framework</p>
              <p className="font-semibold text-neutral-900">Long-term Memory</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
