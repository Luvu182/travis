'use client';

import { useEffect, useState } from 'react';
import { Search, RefreshCw } from 'lucide-react';
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
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Conversations</h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search conversations..."
              className="pl-9 pr-3 py-2 w-64 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            onClick={fetchConversations}
            className="p-2 hover:bg-accent rounded-md transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium">User</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Group</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Message</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Platform</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Time</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-t">
                  <td className="px-4 py-3"><div className="h-4 w-24 bg-muted animate-pulse rounded" /></td>
                  <td className="px-4 py-3"><div className="h-4 w-32 bg-muted animate-pulse rounded" /></td>
                  <td className="px-4 py-3"><div className="h-4 w-48 bg-muted animate-pulse rounded" /></td>
                  <td className="px-4 py-3"><div className="h-4 w-16 bg-muted animate-pulse rounded" /></td>
                  <td className="px-4 py-3"><div className="h-4 w-20 bg-muted animate-pulse rounded" /></td>
                </tr>
              ))
            ) : filteredConversations.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-muted-foreground">
                  No conversations found
                </td>
              </tr>
            ) : (
              filteredConversations.map((conv) => (
                <tr key={conv.id} className="border-t hover:bg-muted/50">
                  <td className="px-4 py-3 font-medium">
                    {conv.userName || 'Unknown'}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {conv.groupName || 'Direct'}
                  </td>
                  <td className="px-4 py-3 max-w-md truncate">
                    {conv.content}
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-muted capitalize">
                      {conv.platform}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-sm">
                    {new Date(conv.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {hasMore && !isLoading && (
        <div className="flex justify-center">
          <button
            onClick={loadMore}
            className="px-4 py-2 border rounded-md hover:bg-accent transition-colors"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
}
