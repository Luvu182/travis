'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';

interface ChatSettings {
  contextLength: number;
  useMemory: boolean;
}

const DEFAULT_CHAT_SETTINGS: ChatSettings = {
  contextLength: 10,
  useMemory: true,
};

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [chatSettings, setChatSettings] = useState<ChatSettings>(DEFAULT_CHAT_SETTINGS);
  const [saved, setSaved] = useState(false);

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('chat-settings');
    if (savedSettings) {
      setChatSettings(JSON.parse(savedSettings));
    }
  }, []);

  // Save chat settings
  const saveChatSettings = () => {
    localStorage.setItem('chat-settings', JSON.stringify(chatSettings));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

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

      {/* Chat Settings */}
      <div className="rounded-lg border bg-card p-4 shadow-sm">
        <h3 className="text-base font-semibold mb-2">Chat Configuration</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Cấu hình trò chuyện với Jarvis
        </p>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium">Context Length</label>
              <p className="text-sm text-muted-foreground">
                Số tin nhắn gần nhất được gửi kèm làm context (giống ChatGPT)
              </p>
            </div>
            <select
              value={chatSettings.contextLength}
              onChange={(e) => setChatSettings(s => ({ ...s, contextLength: Number(e.target.value) }))}
              className="px-3 py-2 border rounded-md bg-background"
            >
              <option value={5}>5 tin nhắn</option>
              <option value={10}>10 tin nhắn</option>
              <option value={15}>15 tin nhắn</option>
              <option value={20}>20 tin nhắn</option>
              <option value={30}>30 tin nhắn</option>
              <option value={50}>50 tin nhắn</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium">Memory Integration</label>
              <p className="text-sm text-muted-foreground">
                Sử dụng long-term memory (mem0) để nhớ thông tin từ các cuộc trò chuyện trước
              </p>
            </div>
            <input
              type="checkbox"
              checked={chatSettings.useMemory}
              onChange={(e) => setChatSettings(s => ({ ...s, useMemory: e.target.checked }))}
              className="h-4 w-4 rounded border-gray-300"
            />
          </div>
          <div className="pt-2">
            <button
              onClick={saveChatSettings}
              className={`px-4 py-2 rounded-md text-sm transition-colors ${
                saved
                  ? 'bg-green-500 text-white'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              {saved ? 'Đã lưu!' : 'Lưu cài đặt Chat'}
            </button>
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
