'use client';

import { signOut, useSession } from 'next-auth/react';
import { Icon, Avatar } from '@/components/ui';

export function Header() {
  const { data: session } = useSession();

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  return (
    <header className="h-16 border-b border-neutral-200 bg-white px-6 flex items-center justify-between">
      <div>
        <h1 className="text-xl font-semibold text-neutral-900">Dashboard</h1>
      </div>
      <div className="flex items-center gap-3">
        {/* User Menu */}
        <div className="flex items-center gap-3 pl-3 border-l border-neutral-200">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-neutral-900">
              {session?.user?.name || 'Admin'}
            </p>
            <p className="text-xs text-neutral-500">
              {session?.user?.email || 'admin@jarvis.local'}
            </p>
          </div>
          <Avatar
            name={session?.user?.name || 'Admin'}
            src={session?.user?.image ?? undefined}
            size="sm"
          />
          <button
            onClick={handleLogout}
            className="p-2 hover:bg-red-50 rounded-lg transition-colors text-neutral-500 hover:text-red-600"
            title="Đăng xuất"
          >
            <Icon name="arrow-right" size="sm" />
          </button>
        </div>
      </div>
    </header>
  );
}
