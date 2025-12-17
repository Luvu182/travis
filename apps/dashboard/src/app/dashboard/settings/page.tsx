'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, Button, Icon } from '@/components/ui';
import { Avatar } from '@/components/ui/avatar';
import { signOut } from 'next-auth/react';

interface ChatSettings {
  contextLength: number;
  useMemory: boolean;
}

const DEFAULT_CHAT_SETTINGS: ChatSettings = {
  contextLength: 10,
  useMemory: true,
};

export default function SettingsPage() {
  const { data: session } = useSession();
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

  const handleLogout = async () => {
    if (confirm('Bạn có chắc muốn đăng xuất?')) {
      await signOut({ callbackUrl: '/login' });
    }
  };

  return (
    <div className="space-y-6 p-6 overflow-auto h-full max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-neutral-900">Cài Đặt</h2>
        <p className="text-sm text-neutral-500 mt-1">
          Tùy chỉnh trải nghiệm chat của bạn
        </p>
      </div>

      {/* Profile */}
      <Card variant="default">
        <h3 className="text-base font-semibold text-neutral-900 mb-4">Hồ Sơ</h3>
        <div className="flex items-center gap-4">
          <Avatar
            size="xl"
            src={session?.user?.image || undefined}
            name={session?.user?.name || 'User'}
          />
          <div>
            <p className="font-semibold text-neutral-900">{session?.user?.name || 'User'}</p>
            <p className="text-sm text-neutral-500">{session?.user?.email}</p>
          </div>
        </div>
      </Card>

      {/* Chat Settings */}
      <Card variant="default">
        <h3 className="text-base font-semibold text-neutral-900 mb-2">Cấu Hình Chat</h3>
        <p className="text-sm text-neutral-500 mb-4">Tùy chỉnh cách trò chuyện với Jarvis</p>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium text-neutral-700">Độ dài ngữ cảnh</label>
              <p className="text-sm text-neutral-500">
                Số tin nhắn gần nhất Jarvis sẽ nhớ trong cuộc trò chuyện
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
              <label className="font-medium text-neutral-700">Ghi nhớ dài hạn</label>
              <p className="text-sm text-neutral-500">
                Cho phép Jarvis ghi nhớ thông tin quan trọng giữa các cuộc trò chuyện
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
              variant="primary"
              size="sm"
              onClick={saveChatSettings}
              className={saved ? 'bg-emerald-500 hover:bg-emerald-600' : ''}
            >
              <Icon name="check" size="xs" className="mr-1" />
              {saved ? 'Đã lưu!' : 'Lưu cài đặt'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Platform Connections */}
      <Card variant="default">
        <h3 className="text-base font-semibold text-neutral-900 mb-2">Kết Nối Nền Tảng</h3>
        <p className="text-sm text-neutral-500 mb-4">Kết nối Jarvis với các nền tảng khác</p>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Icon name="telegram" size="sm" className="text-blue-500" />
              </div>
              <div>
                <p className="font-medium text-neutral-700">Telegram</p>
                <p className="text-xs text-neutral-500">Kết nối với group chat Telegram</p>
              </div>
            </div>
            <Button variant="outline" size="sm" disabled>
              Sắp ra mắt
            </Button>
          </div>
          <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                <Icon name="lark" size="sm" className="text-indigo-500" />
              </div>
              <div>
                <p className="font-medium text-neutral-700">Lark Suite</p>
                <p className="text-xs text-neutral-500">Kết nối với workspace Lark</p>
              </div>
            </div>
            <Button variant="outline" size="sm" disabled>
              Sắp ra mắt
            </Button>
          </div>
        </div>
      </Card>

      {/* Data & Privacy */}
      <Card variant="default">
        <h3 className="text-base font-semibold text-neutral-900 mb-2">Dữ Liệu & Quyền Riêng Tư</h3>
        <p className="text-sm text-neutral-500 mb-4">Quản lý dữ liệu của bạn</p>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Icon name="message" size="sm" className="text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-neutral-700">Lịch sử trò chuyện</p>
                <p className="text-xs text-neutral-500">Xem và quản lý các cuộc hội thoại</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => window.location.href = '/dashboard/history'}>
              Xem
            </Button>
          </div>
          <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Icon name="brain" size="sm" className="text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-neutral-700">Memories</p>
                <p className="text-xs text-neutral-500">Thông tin Jarvis đã ghi nhớ về bạn</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => window.location.href = '/dashboard/memories'}>
              Xem
            </Button>
          </div>
        </div>
      </Card>

      {/* Account */}
      <Card variant="default">
        <h3 className="text-base font-semibold text-neutral-900 mb-2">Tài Khoản</h3>
        <p className="text-sm text-neutral-500 mb-4">Quản lý đăng nhập</p>
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className="text-red-600 border-red-300 hover:bg-red-50"
        >
          Đăng Xuất
        </Button>
      </Card>
    </div>
  );
}
