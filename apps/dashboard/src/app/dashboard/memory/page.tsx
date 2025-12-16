'use client';

import { useEffect, useState } from 'react';
import { Brain, Database, CloudUpload } from 'lucide-react';
import { MetricCard } from '@/components/dashboard/metric-card';
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
      <h2 className="text-2xl font-bold">Memory Analytics</h2>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          title="Vector Store Size"
          value={memory?.vectorStoreSize?.formatted || '0 MB'}
          icon={<Database className="h-5 w-5" />}
          isLoading={isLoading}
        />
        <MetricCard
          title="Embedding Count"
          value={memory?.embeddingCount?.toLocaleString() || '0'}
          icon={<Brain className="h-5 w-5" />}
          isLoading={isLoading}
        />
        <MetricCard
          title="Storage Used"
          value={memory?.storageUsed?.formatted || '0 MB'}
          icon={<CloudUpload className="h-5 w-5" />}
          isLoading={isLoading}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <h3 className="text-base font-semibold mb-4">Growth Trend</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Daily Growth</span>
              <span className="text-green-500 font-medium">
                +{memory?.growthTrend?.daily || 0} memories
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Weekly Growth</span>
              <span className="text-green-500 font-medium">
                +{memory?.growthTrend?.weekly || 0} memories
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <h3 className="text-base font-semibold mb-4">Top Consumers</h3>
          {memory && memory.topConsumers && memory.topConsumers.length > 0 ? (
            <div className="space-y-3">
              {memory.topConsumers.map((consumer: MemoryConsumer, i: number) => (
                <div key={i} className="flex justify-between items-center">
                  <span className="truncate max-w-[200px]">{consumer.name}</span>
                  <span className="text-muted-foreground">{consumer.count} memories</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No data available</p>
          )}
        </div>
      </div>

      <div className="rounded-lg border bg-card p-4 shadow-sm">
        <h3 className="text-base font-semibold mb-4">Memory Management</h3>
        <p className="text-muted-foreground text-sm mb-4">
          Memory is managed by mem0 OSS with pgvector for similarity search.
          Embeddings are generated using Gemini embedding-001 (1536 dimensions).
        </p>
        <div className="flex gap-2">
          <button
            className="px-4 py-2 bg-muted hover:bg-muted/80 rounded-md text-sm transition-colors"
            disabled
          >
            Export Memories
          </button>
          <button
            className="px-4 py-2 bg-muted hover:bg-muted/80 rounded-md text-sm transition-colors"
            disabled
          >
            Cleanup Old Data
          </button>
        </div>
      </div>
    </div>
  );
}
