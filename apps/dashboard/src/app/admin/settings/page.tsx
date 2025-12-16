'use client';

import { useState, useEffect } from 'react';
import { Card, Button, Input, Badge, Icon } from '@/components/ui';
import { signOut } from 'next-auth/react';

interface SystemSettings {
  contextLength: number;
  useMemory: boolean;
}

const DEFAULT_SYSTEM_SETTINGS: SystemSettings = {
  contextLength: 10,
  useMemory: true,
};

export default function AdminSettingsPage() {
  const [systemSettings, setSystemSettings] = useState<SystemSettings>(DEFAULT_SYSTEM_SETTINGS);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const savedSettings = localStorage.getItem('system-settings');
    if (savedSettings) {
      setSystemSettings(JSON.parse(savedSettings));
    }
  }, []);

  const saveSystemSettings = () => {
    localStorage.setItem('system-settings', JSON.stringify(systemSettings));
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">System Settings</h2>
          <p className="text-sm text-neutral-500 mt-1">
            Cấu hình hệ thống (Admin Only)
          </p>
        </div>
        <Badge variant="warning" size="sm">
          <Icon name="shield" size="xs" className="mr-1" />
          Admin
        </Badge>
      </div>

      {/* System Chat Settings */}
      <Card variant="default">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
            <Icon name="message" size="sm" className="text-primary-600" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-neutral-900">Cấu Hình Chat Hệ Thống</h3>
            <p className="text-sm text-neutral-500">Cấu hình mặc định cho tất cả users</p>
          </div>
        </div>

        <div className="space-y-4 pl-14">
          <div className="flex items-center justify-between p-4 rounded-xl bg-neutral-50 border border-neutral-100">
            <div>
              <label className="font-medium text-neutral-700">Default Context Length</label>
              <p className="text-sm text-neutral-500">
                Số tin nhắn gần nhất được gửi kèm làm context (mặc định)
              </p>
            </div>
            <select
              value={systemSettings.contextLength}
              onChange={(e) => setSystemSettings((s) => ({ ...s, contextLength: Number(e.target.value) }))}
              className="px-3 py-2 border border-neutral-200 rounded-xl bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value={5}>5 tin nhắn</option>
              <option value={10}>10 tin nhắn</option>
              <option value={15}>15 tin nhắn</option>
              <option value={20}>20 tin nhắn</option>
              <option value={30}>30 tin nhắn</option>
              <option value={50}>50 tin nhắn</option>
            </select>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-neutral-50 border border-neutral-100">
            <div>
              <label className="font-medium text-neutral-700">Memory Integration</label>
              <p className="text-sm text-neutral-500">
                Bật/tắt long-term memory (mem0) cho toàn hệ thống
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={systemSettings.useMemory}
                onChange={(e) => setSystemSettings((s) => ({ ...s, useMemory: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          <div className="pt-2">
            <Button
              variant={saved ? 'primary' : 'primary'}
              size="sm"
              onClick={saveSystemSettings}
              className={saved ? 'bg-emerald-500 hover:bg-emerald-600' : ''}
            >
              {saved ? (
                <>
                  <Icon name="check" size="xs" className="mr-1" />
                  Đã lưu!
                </>
              ) : (
                'Lưu cài đặt hệ thống'
              )}
            </Button>
          </div>
        </div>
      </Card>

      {/* Notifications */}
      <Card variant="default">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
            <Icon name="lightning" size="sm" className="text-amber-600" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-neutral-900">Cảnh Báo Hệ Thống</h3>
            <p className="text-sm text-neutral-500">Cấu hình thông báo hệ thống</p>
          </div>
        </div>

        <div className="space-y-4 pl-14">
          <div className="flex items-center justify-between p-4 rounded-xl bg-neutral-50 border border-neutral-100">
            <div>
              <label className="font-medium text-neutral-700">Error Rate Alert</label>
              <p className="text-sm text-neutral-500">Thông báo khi error rate &gt; 5%</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                defaultChecked
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-neutral-50 border border-neutral-100">
            <div>
              <label className="font-medium text-neutral-700">Response Time Alert</label>
              <p className="text-sm text-neutral-500">Thông báo khi response time &gt; 1s</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                defaultChecked
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
        </div>
      </Card>

      {/* API Configuration */}
      <Card variant="default">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
            <Icon name="server" size="sm" className="text-blue-600" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-neutral-900">Cấu Hình API</h3>
            <p className="text-sm text-neutral-500">Cài đặt kết nối backend</p>
          </div>
        </div>

        <div className="pl-14 space-y-4">
          <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-100">
            <label className="text-sm font-medium text-neutral-700 mb-2 block">API URL</label>
            <Input
              type="text"
              value={process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}
              disabled
              fullWidth
            />
            <p className="text-xs text-neutral-400 mt-2">
              Cài đặt qua biến môi trường NEXT_PUBLIC_API_URL
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="success" dot size="sm">Kết nối</Badge>
            <span className="text-sm text-neutral-500">Backend API đang hoạt động</span>
          </div>
        </div>
      </Card>

      {/* Account */}
      <Card variant="bordered">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
            <Icon name="user" size="sm" className="text-red-600" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-neutral-900">Admin Account</h3>
            <p className="text-sm text-neutral-500">Quản lý tài khoản admin</p>
          </div>
        </div>

        <div className="pl-14">
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
          >
            <Icon name="arrow-right" size="xs" className="mr-1" />
            Đăng Xuất
          </Button>
        </div>
      </Card>

      {/* System Info */}
      <Card variant="gradient">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0">
            <Icon name="sparkles" size="sm" className="text-primary-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-neutral-900 mb-1">Thông Tin Hệ Thống</h3>
            <p className="text-neutral-600 text-sm mb-4">
              J.A.R.V.I.S Admin Dashboard - Vietnamese Executive Assistant
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="primary" size="sm">v1.0.0</Badge>
              <Badge variant="default" size="sm">Next.js 15</Badge>
              <Badge variant="default" size="sm">TypeScript</Badge>
              <Badge variant="default" size="sm">Tailwind CSS</Badge>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
