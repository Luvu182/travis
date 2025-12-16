'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Card, Button, Input } from '@/components/ui';

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

  useEffect(() => {
    const savedSettings = localStorage.getItem('chat-settings');
    if (savedSettings) {
      setChatSettings(JSON.parse(savedSettings));
    }
  }, []);

  const saveChatSettings = () => {
    localStorage.setItem('chat-settings', JSON.stringify(chatSettings));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-neutral-900">Cài Đặt</h2>

      {/* Appearance */}
      <Card variant="default">
        <h3 className="text-base font-semibold text-neutral-900 mb-2">Giao Diện</h3>
        <p className="text-sm text-neutral-500 mb-4">Tùy chỉnh giao diện dashboard</p>
        <div className="flex items-center justify-between">
          <div>
            <label className="font-medium text-neutral-700">Theme</label>
            <p className="text-sm text-neutral-500">Chọn theme yêu thích</p>
          </div>
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="px-3 py-2 border border-neutral-300 rounded-xl bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="light">Sáng</option>
            <option value="dark">Tối</option>
            <option value="system">Theo hệ thống</option>
          </select>
        </div>
      </Card>

      {/* Notifications */}
      <Card variant="default">
        <h3 className="text-base font-semibold text-neutral-900 mb-2">Thông Báo</h3>
        <p className="text-sm text-neutral-500 mb-4">Cấu hình thông báo</p>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium text-neutral-700">Cảnh báo lỗi</label>
              <p className="text-sm text-neutral-500">Nhận thông báo khi error rate vượt ngưỡng</p>
            </div>
            <input
              type="checkbox"
              defaultChecked
              className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium text-neutral-700">Cảnh báo hiệu năng</label>
              <p className="text-sm text-neutral-500">Thông báo khi response time vượt 1 giây</p>
            </div>
            <input
              type="checkbox"
              defaultChecked
              className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
            />
          </div>
        </div>
      </Card>

      {/* Chat Settings */}
      <Card variant="default">
        <h3 className="text-base font-semibold text-neutral-900 mb-2">Cấu Hình Chat</h3>
        <p className="text-sm text-neutral-500 mb-4">Cấu hình trò chuyện với Jarvis</p>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium text-neutral-700">Context Length</label>
              <p className="text-sm text-neutral-500">
                Số tin nhắn gần nhất được gửi kèm làm context
              </p>
            </div>
            <select
              value={chatSettings.contextLength}
              onChange={(e) => setChatSettings((s) => ({ ...s, contextLength: Number(e.target.value) }))}
              className="px-3 py-2 border border-neutral-300 rounded-xl bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
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
              <label className="font-medium text-neutral-700">Memory Integration</label>
              <p className="text-sm text-neutral-500">
                Sử dụng long-term memory (mem0) để nhớ thông tin
              </p>
            </div>
            <input
              type="checkbox"
              checked={chatSettings.useMemory}
              onChange={(e) => setChatSettings((s) => ({ ...s, useMemory: e.target.checked }))}
              className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
            />
          </div>
          <div className="pt-2">
            <Button
              variant={saved ? 'primary' : 'primary'}
              size="sm"
              onClick={saveChatSettings}
              className={saved ? 'bg-emerald-500 hover:bg-emerald-600' : ''}
            >
              {saved ? 'Đã lưu!' : 'Lưu cài đặt Chat'}
            </Button>
          </div>
        </div>
      </Card>

      {/* API Configuration */}
      <Card variant="default">
        <h3 className="text-base font-semibold text-neutral-900 mb-2">Cấu Hình API</h3>
        <p className="text-sm text-neutral-500 mb-4">Cài đặt kết nối backend API</p>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-neutral-700">API URL</label>
            <Input
              type="text"
              value={process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}
              disabled
              className="mt-1"
              fullWidth
            />
          </div>
          <p className="text-xs text-neutral-400">
            Cài đặt qua biến môi trường NEXT_PUBLIC_API_URL
          </p>
        </div>
      </Card>

      {/* Account */}
      <Card variant="default">
        <h3 className="text-base font-semibold text-neutral-900 mb-2">Tài Khoản</h3>
        <p className="text-sm text-neutral-500 mb-4">Quản lý tài khoản admin</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            if (confirm('Bạn có chắc muốn đăng xuất?')) {
              window.location.href = '/login';
            }
          }}
          className="text-red-600 border-red-300 hover:bg-red-50"
        >
          Đăng Xuất
        </Button>
      </Card>
    </div>
  );
}
