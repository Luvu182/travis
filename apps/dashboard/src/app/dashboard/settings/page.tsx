'use client';

import { useTheme } from 'next-themes';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Settings</h2>

      <div className="rounded-lg border bg-card p-4 shadow-sm">
        <h3 className="text-base font-semibold mb-2">Appearance</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Customize the dashboard appearance
        </p>
        <div className="flex items-center justify-between">
          <div>
            <label className="font-medium">Theme</label>
            <p className="text-sm text-muted-foreground">
              Select your preferred theme
            </p>
          </div>
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="px-3 py-2 border rounded-md bg-background"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="system">System</option>
          </select>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-4 shadow-sm">
        <h3 className="text-base font-semibold mb-2">Notifications</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Configure alert preferences
        </p>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium">Error Alerts</label>
              <p className="text-sm text-muted-foreground">
                Receive alerts when error rate exceeds threshold
              </p>
            </div>
            <input
              type="checkbox"
              defaultChecked
              className="h-4 w-4 rounded border-gray-300"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium">Performance Alerts</label>
              <p className="text-sm text-muted-foreground">
                Alert when response time exceeds 1 second
              </p>
            </div>
            <input
              type="checkbox"
              defaultChecked
              className="h-4 w-4 rounded border-gray-300"
            />
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-4 shadow-sm">
        <h3 className="text-base font-semibold mb-2">API Configuration</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Backend API connection settings
        </p>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium">API URL</label>
            <input
              type="text"
              value={process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}
              disabled
              className="mt-1 w-full px-3 py-2 border rounded-md bg-muted text-muted-foreground"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Set via NEXT_PUBLIC_API_URL environment variable
          </p>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-4 shadow-sm">
        <h3 className="text-base font-semibold mb-2">Account</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Manage your admin account
        </p>
        <button
          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md text-sm transition-colors"
          onClick={() => {
            if (confirm('Are you sure you want to log out?')) {
              window.location.href = '/login';
            }
          }}
        >
          Log Out
        </button>
      </div>
    </div>
  );
}
