'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, Badge, Button, Input, Icon } from '@/components/ui';

interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
}

export default function UserHistoryPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchConversations();
  }, []);

  async function fetchConversations() {
    setIsLoading(true);
    try {
      const res = await fetch('/api/chat');
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations || []);
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const filteredConversations = conversations.filter(
    (c) => c.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa cuộc trò chuyện này?')) return;
    try {
      const res = await fetch(`/api/chat/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setConversations((prev) => prev.filter((c) => c.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error);
    }
  };

  return (
    <div className="space-y-6 p-6 overflow-auto h-full">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Lịch Sử Chat</h2>
          <p className="text-sm text-neutral-500 mt-1">
            Xem và quản lý các cuộc trò chuyện của bạn
          </p>
        </div>
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
          <Link href="/dashboard/chat">
            <Button variant="primary" size="sm">
              <Icon name="plus" size="xs" className="mr-1" />
              New Chat
            </Button>
          </Link>
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
              <p className="text-sm text-neutral-500">Tổng cuộc trò chuyện</p>
              <p className="text-xl font-bold text-neutral-900">{conversations.length}</p>
            </div>
          </div>
        </Card>
        <Card variant="default" padding="sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
              <Icon name="message" size="sm" className="text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Tổng tin nhắn</p>
              <p className="text-xl font-bold text-neutral-900">
                {conversations.reduce((sum, c) => sum + (c.messageCount || 0), 0)}
              </p>
            </div>
          </div>
        </Card>
        <Card variant="default" padding="sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <Icon name="clock" size="sm" className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Gần đây nhất</p>
              <p className="text-xl font-bold text-neutral-900">
                {conversations[0]
                  ? new Date(conversations[0].updatedAt).toLocaleDateString('vi-VN')
                  : 'N/A'}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Conversations List */}
      <Card variant="default" padding="none">
        <div className="p-4 border-b border-neutral-200">
          <h3 className="font-semibold text-neutral-900">Danh sách cuộc trò chuyện</h3>
        </div>
        <div className="divide-y divide-neutral-100">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-4">
                <div className="h-5 w-48 bg-neutral-100 animate-pulse rounded mb-2" />
                <div className="h-4 w-24 bg-neutral-100 animate-pulse rounded" />
              </div>
            ))
          ) : filteredConversations.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto mb-4">
                <Icon name="message" size="lg" className="text-neutral-400" />
              </div>
              <p className="text-neutral-500 font-medium">
                {search ? 'Không tìm thấy kết quả' : 'Chưa có cuộc trò chuyện nào'}
              </p>
              <p className="text-sm text-neutral-400 mt-1">
                {search ? 'Thử tìm với từ khóa khác' : 'Bắt đầu chat mới để tạo cuộc trò chuyện'}
              </p>
              {!search && (
                <Link href="/dashboard/chat" className="inline-block mt-4">
                  <Button variant="primary" size="sm">
                    <Icon name="plus" size="xs" className="mr-1" />
                    Bắt đầu chat
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            filteredConversations.map((conv) => (
              <div
                key={conv.id}
                className="flex items-center justify-between p-4 hover:bg-neutral-50 transition-colors"
              >
                <Link
                  href={`/dashboard/chat/${conv.id}`}
                  className="flex items-center gap-3 flex-1 min-w-0"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center shrink-0">
                    <Icon name="message" size="sm" className="text-primary-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-neutral-900 truncate">{conv.title}</p>
                    <div className="flex items-center gap-2 text-xs text-neutral-500">
                      <span>{conv.messageCount || 0} tin nhắn</span>
                      <span>•</span>
                      <span>{new Date(conv.updatedAt).toLocaleString('vi-VN')}</span>
                    </div>
                  </div>
                </Link>
                <div className="flex items-center gap-2 ml-4">
                  <Link href={`/dashboard/chat/${conv.id}`}>
                    <Button variant="ghost" size="sm">
                      <Icon name="arrow-right" size="xs" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(conv.id)}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    <Icon name="x" size="xs" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
