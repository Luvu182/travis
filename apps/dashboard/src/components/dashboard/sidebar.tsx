'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from '@/components/ui';
import type { IconName } from '@/components/ui';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/stores/ui';

interface RecentChat {
  id: string;
  title: string;
}

const mainNavItems: Array<{ href: string; icon: IconName; label: string }> = [
  { href: '/dashboard', icon: 'analytics', label: 'Tổng quan' },
];

const bottomNavItems: Array<{ href: string; icon: IconName; label: string }> = [
  { href: '/dashboard/history', icon: 'clock', label: 'Lịch sử chat' },
  { href: '/dashboard/memories', icon: 'brain', label: 'Memories' },
  { href: '/dashboard/settings', icon: 'settings', label: 'Cài đặt' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const [recentChats, setRecentChats] = useState<RecentChat[]>([]);

  // Fetch recent chats
  useEffect(() => {
    async function fetchRecentChats() {
      try {
        const res = await fetch('/api/chat');
        if (res.ok) {
          const data = await res.json();
          setRecentChats((data.conversations || []).slice(0, 5));
        }
      } catch (error) {
        console.error('Failed to fetch recent chats:', error);
      }
    }
    fetchRecentChats();
  }, [pathname]); // Refetch when navigating

  const isNavActive = (href: string) => {
    if (href === '/dashboard') return pathname === href;
    return pathname.startsWith(href);
  };

  const isChatActive = pathname === '/dashboard/chat' || pathname.startsWith('/dashboard/chat/');

  return (
    <aside
      className={cn(
        'flex flex-col border-r border-neutral-200 bg-white transition-all duration-300',
        sidebarCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-neutral-200">
        {!sidebarCollapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/25">
              <Icon name="sparkles" size="xs" className="text-white" />
            </div>
            <span className="text-lg font-bold text-neutral-900">J.A.R.V.I.S</span>
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className="p-2 hover:bg-neutral-100 rounded-lg transition-colors text-neutral-500"
        >
          <Icon name={sidebarCollapsed ? 'chevron-right' : 'arrow-left'} size="xs" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {/* Main nav items */}
        {mainNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
              isNavActive(item.href)
                ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
            )}
          >
            <Icon name={item.icon} size="sm" className="shrink-0" />
            {!sidebarCollapsed && <span>{item.label}</span>}
          </Link>
        ))}

        {/* New Thread button */}
        <Link
          href="/dashboard/chat"
          className={cn(
            'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
            isChatActive && !pathname.includes('/chat/')
              ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
              : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
          )}
        >
          <Icon name="plus" size="sm" className="shrink-0" />
          {!sidebarCollapsed && <span>New Thread</span>}
        </Link>

        {/* Recent Chats */}
        {!sidebarCollapsed && recentChats.length > 0 && (
          <div className="pt-2 space-y-1">
            {recentChats.map((chat) => (
              <Link
                key={chat.id}
                href={`/dashboard/chat/${chat.id}`}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-all',
                  pathname === `/dashboard/chat/${chat.id}`
                    ? 'bg-primary-50 text-primary-700 border border-primary-200'
                    : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-700'
                )}
              >
                <Icon name="message" size="xs" className="shrink-0 opacity-60" />
                <span className="truncate">{chat.title}</span>
              </Link>
            ))}
          </div>
        )}

        {/* Divider */}
        <div className="pt-4 pb-2">
          {!sidebarCollapsed && (
            <div className="h-px bg-neutral-200" />
          )}
        </div>

        {/* Bottom nav items */}
        {bottomNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
              isNavActive(item.href)
                ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
            )}
          >
            <Icon name={item.icon} size="sm" className="shrink-0" />
            {!sidebarCollapsed && <span>{item.label}</span>}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-neutral-200">
        <div className={cn(
          'rounded-xl bg-neutral-50 p-3',
          sidebarCollapsed && 'p-2'
        )}>
          {!sidebarCollapsed ? (
            <div className="text-xs text-neutral-500">
              <p className="font-medium text-neutral-700 mb-1">Phiên bản 1.0</p>
              <p>Powered by Gemini AI</p>
            </div>
          ) : (
            <Icon name="sparkles" size="xs" className="text-neutral-400 mx-auto" />
          )}
        </div>
      </div>
    </aside>
  );
}
