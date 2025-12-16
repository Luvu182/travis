'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Card, Badge, Icon, StatCard, Button } from '@/components/ui';

interface UserStats {
  totalConversations: number;
  totalMessages: number;
  memoriesCount: number;
  lastActive: string | null;
}

interface RecentConversation {
  id: string;
  title: string;
  updatedAt: string;
}

export default function UserDashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<UserStats>({
    totalConversations: 0,
    totalMessages: 0,
    memoriesCount: 0,
    lastActive: null,
  });
  const [recentConversations, setRecentConversations] = useState<RecentConversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch user stats
        const statsRes = await fetch('/api/dashboard/me/stats');
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }

        // Fetch recent conversations
        const convRes = await fetch('/api/chat');
        if (convRes.ok) {
          const convData = await convRes.json();
          setRecentConversations((convData.conversations || []).slice(0, 5));
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="space-y-6 p-6 overflow-auto h-full">
      {/* Welcome Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">
            Xin chào, {session?.user?.name || 'User'}!
          </h2>
          <p className="text-sm text-neutral-500 mt-1">
            Dashboard cá nhân của bạn
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="primary" size="sm">
            <Icon name="user" size="xs" className="mr-1" />
            {session?.user?.role || 'user'}
          </Badge>
          {session?.user?.role === 'admin' && (
            <Link href="/admin">
              <Button variant="outline" size="sm">
                <Icon name="shield" size="xs" className="mr-1" />
                Admin Panel
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* User Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Cuộc Trò Chuyện"
          value={stats.totalConversations}
          icon="message"
        />
        <StatCard
          label="Tin Nhắn"
          value={stats.totalMessages}
          icon="send"
        />
        <StatCard
          label="Memories"
          value={stats.memoriesCount}
          icon="brain"
        />
        <StatCard
          label="Hoạt Động Gần Đây"
          value={stats.lastActive ? new Date(stats.lastActive).toLocaleDateString('vi-VN') : 'N/A'}
          icon="clock"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent Conversations */}
        <Card variant="default">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-neutral-900">Cuộc Trò Chuyện Gần Đây</h3>
            <Link href="/dashboard/history">
              <Button variant="ghost" size="sm">
                Xem tất cả
                <Icon name="chevron-right" size="xs" className="ml-1" />
              </Button>
            </Link>
          </div>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-12 bg-neutral-100 animate-pulse rounded-xl" />
              ))}
            </div>
          ) : recentConversations.length > 0 ? (
            <div className="space-y-2">
              {recentConversations.map((conv) => (
                <Link
                  key={conv.id}
                  href={`/dashboard/chat/${conv.id}`}
                  className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 hover:bg-neutral-100 transition-colors border border-neutral-100"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center">
                      <Icon name="message" size="xs" className="text-primary-600" />
                    </div>
                    <span className="font-medium text-neutral-700 truncate max-w-[200px]">
                      {conv.title}
                    </span>
                  </div>
                  <span className="text-xs text-neutral-400">
                    {new Date(conv.updatedAt).toLocaleDateString('vi-VN')}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-xl bg-neutral-100 flex items-center justify-center mx-auto mb-3">
                <Icon name="message" size="md" className="text-neutral-400" />
              </div>
              <p className="text-neutral-500 text-sm mb-3">Chưa có cuộc trò chuyện nào</p>
              <Link href="/dashboard/chat">
                <Button variant="primary" size="sm">
                  <Icon name="plus" size="xs" className="mr-1" />
                  Bắt đầu chat
                </Button>
              </Link>
            </div>
          )}
        </Card>

        {/* Quick Start */}
        <Card variant="gradient">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0">
              <Icon name="sparkles" size="md" className="text-primary-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-semibold text-neutral-900 mb-1">Bắt Đầu Nhanh</h3>
              <p className="text-neutral-600 text-sm mb-4">
                J.A.R.V.I.S - Trợ lý thông minh với khả năng ghi nhớ dài hạn.
                Hỏi bất cứ điều gì và tôi sẽ nhớ context cho lần sau!
              </p>
              <div className="flex gap-3">
                <Link href="/dashboard/chat">
                  <Button variant="primary" size="sm">
                    <Icon name="message" size="xs" className="mr-1" />
                    New Chat
                  </Button>
                </Link>
                <Link href="/dashboard/memories">
                  <Button variant="outline" size="sm">
                    <Icon name="brain" size="xs" className="mr-1" />
                    My Memories
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Platform Connections - Coming Soon */}
      <Card variant="bordered">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-neutral-900">Nền Tảng Kết Nối</h3>
          <Badge variant="default" size="sm">Coming Soon</Badge>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex items-center justify-between p-4 rounded-xl bg-neutral-50 border border-neutral-100 opacity-60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <Icon name="telegram" size="sm" className="text-blue-500" />
              </div>
              <div>
                <p className="font-medium text-neutral-900">Telegram</p>
                <p className="text-xs text-neutral-500">Kết nối group chat</p>
              </div>
            </div>
            <Badge variant="default" size="sm">Chưa kết nối</Badge>
          </div>
          <div className="flex items-center justify-between p-4 rounded-xl bg-neutral-50 border border-neutral-100 opacity-60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
                <Icon name="lark" size="sm" className="text-indigo-500" />
              </div>
              <div>
                <p className="font-medium text-neutral-900">Lark Suite</p>
                <p className="text-xs text-neutral-500">Kết nối workspace</p>
              </div>
            </div>
            <Badge variant="default" size="sm">Chưa kết nối</Badge>
          </div>
        </div>
      </Card>
    </div>
  );
}
