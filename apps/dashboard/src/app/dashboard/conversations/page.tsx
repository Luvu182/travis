'use client';

import { useEffect, useState } from 'react';
import { Card, Badge, Button, Input, Icon } from '@/components/ui';
import { dashboardAPI } from '@/lib/api';

interface Conversation {
  id: string;
  content: string;
  createdAt: string;
  groupName: string | null;
  userName: string | null;
  platform: string;
}

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const limit = 20;

  useEffect(() => {
    fetchConversations();
  }, []);

  async function fetchConversations() {
    setIsLoading(true);
    try {
      const data = await dashboardAPI.getConversationHistory({ limit, offset: 0 });
      setConversations(data.data);
      setHasMore(data.pagination.hasMore);
      setOffset(0);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const loadMore = async () => {
    const newOffset = offset + limit;
    const data = await dashboardAPI.getConversationHistory({ limit, offset: newOffset });
    setConversations((prev) => [...prev, ...data.data]);
    setHasMore(data.pagination.hasMore);
    setOffset(newOffset);
  };

  const filteredConversations = conversations.filter(
    (c) =>
      c.content.toLowerCase().includes(search.toLowerCase()) ||
      c.userName?.toLowerCase().includes(search.toLowerCase()) ||
      c.groupName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-2xl font-bold text-neutral-900">Lịch Sử Hội Thoại</h2>
        <div className="flex items-center gap-3">
          <Input
            type="text"
            placeholder="Tìm kiếm..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Icon name="search" size="xs" />}
            className="w-64"
          />
          <Button variant="outline" size="sm" onClick={fetchConversations}>
            <Icon name="refresh" size="xs" className="mr-1" />
            Làm mới
          </Button>
        </div>
      </div>

      {/* Table */}
      <Card variant="default" padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-700">Người dùng</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-700">Nhóm</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-700">Tin nhắn</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-700">Nền tảng</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-700">Thời gian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-4 py-3"><div className="h-4 w-24 bg-neutral-100 animate-pulse rounded" /></td>
                    <td className="px-4 py-3"><div className="h-4 w-32 bg-neutral-100 animate-pulse rounded" /></td>
                    <td className="px-4 py-3"><div className="h-4 w-48 bg-neutral-100 animate-pulse rounded" /></td>
                    <td className="px-4 py-3"><div className="h-4 w-16 bg-neutral-100 animate-pulse rounded" /></td>
                    <td className="px-4 py-3"><div className="h-4 w-20 bg-neutral-100 animate-pulse rounded" /></td>
                  </tr>
                ))
              ) : filteredConversations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-neutral-500">
                    <Icon name="message" size="lg" className="mx-auto mb-2 text-neutral-300" />
                    <p>Không tìm thấy hội thoại nào</p>
                  </td>
                </tr>
              ) : (
                filteredConversations.map((conv) => (
                  <tr key={conv.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-neutral-900">
                      {conv.userName || 'Unknown'}
                    </td>
                    <td className="px-4 py-3 text-neutral-600">
                      {conv.groupName || 'Direct'}
                    </td>
                    <td className="px-4 py-3 max-w-md truncate text-neutral-700">
                      {conv.content}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="default" size="sm">
                        {conv.platform}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-neutral-500 text-sm">
                      {new Date(conv.createdAt).toLocaleString('vi-VN')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Load More */}
      {hasMore && !isLoading && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={loadMore}>
            Tải thêm
          </Button>
        </div>
      )}
    </div>
  );
}
