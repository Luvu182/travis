'use client';

import { useEffect, useState } from 'react';
import { Card, StatCard, Button, Badge } from '@/components/ui';
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

export default function MemoryPage() {
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
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-neutral-900">Phân Tích Bộ Nhớ</h2>

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
          <h3 className="text-base font-semibold text-neutral-900 mb-4">Xu Hướng Tăng Trưởng</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-neutral-600">Tăng trưởng hàng ngày</span>
              <Badge variant="success">+{memory?.growthTrend?.daily || 0} memories</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-600">Tăng trưởng hàng tuần</span>
              <Badge variant="success">+{memory?.growthTrend?.weekly || 0} memories</Badge>
            </div>
          </div>
        </Card>

        <Card variant="default">
          <h3 className="text-base font-semibold text-neutral-900 mb-4">Top Consumers</h3>
          {memory && memory.topConsumers && memory.topConsumers.length > 0 ? (
            <div className="space-y-3">
              {memory.topConsumers.map((consumer: MemoryConsumer, i: number) => (
                <div key={i} className="flex justify-between items-center">
                  <span className="truncate max-w-[200px] text-neutral-700">{consumer.name}</span>
                  <span className="text-neutral-500 text-sm">{consumer.count} memories</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-neutral-500 text-sm">Chưa có dữ liệu</p>
          )}
        </Card>
      </div>

      {/* Memory Management */}
      <Card variant="default">
        <h3 className="text-base font-semibold text-neutral-900 mb-2">Quản Lý Bộ Nhớ</h3>
        <p className="text-neutral-500 text-sm mb-4">
          Memory được quản lý bởi mem0 OSS với pgvector cho tìm kiếm tương tự.
          Embeddings được tạo bằng Gemini embedding-001 (1536 dimensions).
        </p>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" disabled>
            Export Memories
          </Button>
          <Button variant="outline" size="sm" disabled>
            Cleanup Old Data
          </Button>
        </div>
      </Card>
    </div>
  );
}
