'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from '@/components/ui';
import type { IconName } from '@/components/ui';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/stores/ui';

const adminNavItems: Array<{ href: string; icon: IconName; label: string }> = [
  { href: '/admin', icon: 'analytics', label: 'System Overview' },
  { href: '/admin/users', icon: 'user', label: 'Users' },
  { href: '/admin/conversations', icon: 'message', label: 'All Conversations' },
  { href: '/admin/memory', icon: 'brain', label: 'System Memory' },
  { href: '/admin/settings', icon: 'settings', label: 'System Settings' },
];

const quickLinks: Array<{ href: string; icon: IconName; label: string }> = [
  { href: '/dashboard', icon: 'arrow-left', label: 'User Dashboard' },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();

  const isNavActive = (href: string) => {
    if (href === '/admin') return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={cn(
        'flex flex-col border-r border-neutral-200 bg-neutral-900 transition-all duration-300',
        sidebarCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-neutral-700">
        {!sidebarCollapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/25">
              <Icon name="shield" size="xs" className="text-white" />
            </div>
            <span className="text-lg font-bold text-white">Admin</span>
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className="p-2 hover:bg-neutral-800 rounded-lg transition-colors text-neutral-400"
        >
          <Icon name={sidebarCollapsed ? 'chevron-right' : 'arrow-left'} size="xs" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {/* Admin nav items */}
        {adminNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
              isNavActive(item.href)
                ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/25'
                : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
            )}
          >
            <Icon name={item.icon} size="sm" className="shrink-0" />
            {!sidebarCollapsed && <span>{item.label}</span>}
          </Link>
        ))}

        {/* Divider */}
        <div className="pt-4 pb-2">
          {!sidebarCollapsed && (
            <div className="h-px bg-neutral-700" />
          )}
        </div>

        {/* Quick links */}
        {quickLinks.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
              'text-neutral-400 hover:bg-neutral-800 hover:text-white'
            )}
          >
            <Icon name={item.icon} size="sm" className="shrink-0" />
            {!sidebarCollapsed && <span>{item.label}</span>}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-neutral-700">
        <div className={cn(
          'rounded-xl bg-neutral-800 p-3',
          sidebarCollapsed && 'p-2'
        )}>
          {!sidebarCollapsed ? (
            <div className="text-xs text-neutral-500">
              <p className="font-medium text-neutral-300 mb-1">Admin Panel</p>
              <p>J.A.R.V.I.S v1.0</p>
            </div>
          ) : (
            <Icon name="shield" size="xs" className="text-neutral-500 mx-auto" />
          )}
        </div>
      </div>
    </aside>
  );
}
