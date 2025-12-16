'use client';

import { useRouter } from 'next/navigation';
import { Moon, Sun, LogOut } from 'lucide-react';
import { useTheme } from 'next-themes';
import { logout } from '@/lib/auth';

export function Header() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <header className="h-16 border-b bg-card px-6 flex items-center justify-between">
      <div>
        <h1 className="text-xl font-semibold">Dashboard</h1>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 hover:bg-accent rounded-md transition-colors"
        >
          {theme === 'dark' ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </button>
        <button
          onClick={handleLogout}
          className="p-2 hover:bg-accent rounded-md transition-colors text-muted-foreground hover:text-foreground"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
