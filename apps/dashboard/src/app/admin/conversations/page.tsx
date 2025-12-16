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

export default function AdminConversationsPage() {
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

  const getPlatformBadge = (platform: string) => {
    const variants: Record<string, 'primary' | 'info' | 'success' | 'default'> = {
      telegram: 'info',
      lark: 'primary',
      web: 'success',
    };
    return variants[platform.toLowerCase()] || 'default';
  };

  return (
    <div className="space-y-6 p-6 overflow-auto h-full">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">All Conversations</h2>
          <p className="text-sm text-neutral-500 mt-1">
            Xem tất cả tin nhắn từ các nền tảng (Admin Only)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="warning" size="sm">
            <Icon name="shield" size="xs" className="mr-1" />
            Admin
          </Badge>
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

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card variant="default" padding="sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
              <Icon name="message" size="sm" className="text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Tổng tin nhắn</p>
              <p className="text-xl font-bold text-neutral-900">{conversations.length}</p>
            </div>
          </div>
        </Card>
        <Card variant="default" padding="sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
              <Icon name="user" size="sm" className="text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Người dùng</p>
              <p className="text-xl font-bold text-neutral-900">
                {new Set(conversations.map(c => c.userName).filter(Boolean)).size}
              </p>
            </div>
          </div>
        </Card>
        <Card variant="default" padding="sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <Icon name="globe" size="sm" className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Nhóm</p>
              <p className="text-xl font-bold text-neutral-900">
                {new Set(conversations.map(c => c.groupName).filter(Boolean)).size}
              </p>
            </div>
          </div>
        </Card>
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
                  <td colSpan={5} className="text-center py-12">
                    <div className="w-16 h-16 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto mb-4">
                      <Icon name="message" size="lg" className="text-neutral-400" />
                    </div>
                    <p className="text-neutral-500 font-medium">Không tìm thấy hội thoại nào</p>
                    <p className="text-sm text-neutral-400 mt-1">
                      {search ? 'Thử tìm với từ khóa khác' : 'Chưa có tin nhắn nào'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredConversations.map((conv) => (
                  <tr key={conv.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-xs font-medium text-primary-600">
                            {(conv.userName || 'U')[0].toUpperCase()}
                          </span>
                        </div>
                        <span className="font-medium text-neutral-900">
                          {conv.userName || 'Unknown'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-neutral-600">
                      {conv.groupName || <span className="text-neutral-400">Direct</span>}
                    </td>
                    <td className="px-4 py-3 max-w-md">
                      <p className="truncate text-neutral-700">{conv.content}</p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={getPlatformBadge(conv.platform)} size="sm">
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
            <Icon name="chevron-down" size="xs" className="mr-1" />
            Tải thêm
          </Button>
        </div>
      )}
    </div>
  );
}
