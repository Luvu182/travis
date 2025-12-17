'use client';

import { useEffect, useState } from 'react';
import { Card, Badge, Button, Input, Icon, StatCard } from '@/components/ui';

interface Memory {
  id: string;
  memory: string;
  metadata?: {
    sender_name?: string;
    group_name?: string;
    sent_at?: string;
  };
  created_at?: string;
}

export default function UserMemoriesPage() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchMemories();
  }, []);

  async function fetchMemories() {
    setIsLoading(true);
    try {
      const res = await fetch('/api/dashboard/me/memories');
      if (res.ok) {
        const data = await res.json();
        setMemories(data.memories || []);
      }
    } catch (error) {
      console.error('Failed to fetch memories:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const filteredMemories = memories.filter(
    (m) => m.memory.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 p-6 overflow-auto h-full">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">My Memories</h2>
          <p className="text-sm text-neutral-500 mt-1">
            Xem các thông tin J.A.R.V.I.S đã ghi nhớ về bạn
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Input
            type="text"
            placeholder="Tìm kiếm memories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Icon name="search" size="xs" />}
            className="w-64"
          />
          <Button variant="outline" size="sm" onClick={fetchMemories}>
            <Icon name="refresh" size="xs" className="mr-1" />
            Làm mới
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Tổng Memories"
          value={memories.length}
          icon="brain"
        />
        <StatCard
          label="Từ Groups"
          value={new Set(memories.map(m => m.metadata?.group_name).filter(Boolean)).size}
          icon="globe"
        />
        <StatCard
          label="Gần Đây Nhất"
          value={memories[0]?.created_at
            ? new Date(memories[0].created_at).toLocaleDateString('vi-VN')
            : 'N/A'}
          icon="clock"
        />
      </div>

      {/* Info Card */}
      <Card variant="gradient">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0">
            <Icon name="brain" size="md" className="text-primary-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-neutral-900 mb-1">Về Memory System</h3>
            <p className="text-neutral-600 text-sm">
              J.A.R.V.I.S sử dụng AI để lưu trữ thông tin quan trọng từ các cuộc trò chuyện.
              Memories được chia sẻ trong group - thông tin một người nói, cả nhóm có thể access.
              Điều này giúp bot nhớ context và cung cấp câu trả lời chính xác hơn.
            </p>
          </div>
        </div>
      </Card>

      {/* Memories List */}
      <Card variant="default" padding="none">
        <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
          <h3 className="font-semibold text-neutral-900">Danh sách Memories</h3>
          <Badge variant="primary" size="sm">
            {filteredMemories.length} memories
          </Badge>
        </div>
        <div className="divide-y divide-neutral-100">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-4">
                <div className="h-5 w-full bg-neutral-100 animate-pulse rounded mb-2" />
                <div className="h-4 w-32 bg-neutral-100 animate-pulse rounded" />
              </div>
            ))
          ) : filteredMemories.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto mb-4">
                <Icon name="brain" size="lg" className="text-neutral-400" />
              </div>
              <p className="text-neutral-500 font-medium">
                {search ? 'Không tìm thấy kết quả' : 'Chưa có memory nào'}
              </p>
              <p className="text-sm text-neutral-400 mt-1">
                {search
                  ? 'Thử tìm với từ khóa khác'
                  : 'Bắt đầu chat để J.A.R.V.I.S ghi nhớ thông tin'}
              </p>
            </div>
          ) : (
            filteredMemories.map((memory) => (
              <div
                key={memory.id}
                className="p-4 hover:bg-neutral-50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon name="sparkles" size="xs" className="text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-neutral-900">{memory.memory}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-neutral-500">
                      {memory.metadata?.sender_name && (
                        <span className="flex items-center gap-1">
                          <Icon name="user" size="xs" />
                          {memory.metadata.sender_name}
                        </span>
                      )}
                      {memory.metadata?.group_name && (
                        <span className="flex items-center gap-1">
                          <Icon name="globe" size="xs" />
                          {memory.metadata.group_name}
                        </span>
                      )}
                      {memory.created_at && (
                        <span className="flex items-center gap-1">
                          <Icon name="clock" size="xs" />
                          {new Date(memory.created_at).toLocaleString('vi-VN')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
