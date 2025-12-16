'use client';

import { useEffect, useState } from 'react';
import { Card, Badge, Button, Input, Icon } from '@/components/ui';

interface User {
  id: string;
  name: string | null;
  email: string;
  role: 'admin' | 'user';
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const filteredUsers = users.filter(
    (u) =>
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 p-6 overflow-auto h-full">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">User Management</h2>
          <p className="text-sm text-neutral-500 mt-1">
            Quản lý tài khoản người dùng dashboard (Admin Only)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="warning" size="sm">
            <Icon name="shield" size="xs" className="mr-1" />
            Admin
          </Badge>
          <Input
            type="text"
            placeholder="Tìm kiếm user..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Icon name="search" size="xs" />}
            className="w-64"
          />
          <Button variant="outline" size="sm" onClick={fetchUsers}>
            <Icon name="refresh" size="xs" className="mr-1" />
            Làm mới
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card variant="default" padding="sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
              <Icon name="user" size="sm" className="text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Tổng users</p>
              <p className="text-xl font-bold text-neutral-900">{users.length}</p>
            </div>
          </div>
        </Card>
        <Card variant="default" padding="sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
              <Icon name="shield" size="sm" className="text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Admins</p>
              <p className="text-xl font-bold text-neutral-900">
                {users.filter(u => u.role === 'admin').length}
              </p>
            </div>
          </div>
        </Card>
        <Card variant="default" padding="sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
              <Icon name="check" size="sm" className="text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Active</p>
              <p className="text-xl font-bold text-neutral-900">
                {users.filter(u => u.isActive).length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Table */}
      <Card variant="default" padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-700">User</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-700">Email</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-700">Role</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-700">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-700">Last Login</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-700">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-4 py-3"><div className="h-4 w-24 bg-neutral-100 animate-pulse rounded" /></td>
                    <td className="px-4 py-3"><div className="h-4 w-32 bg-neutral-100 animate-pulse rounded" /></td>
                    <td className="px-4 py-3"><div className="h-4 w-16 bg-neutral-100 animate-pulse rounded" /></td>
                    <td className="px-4 py-3"><div className="h-4 w-16 bg-neutral-100 animate-pulse rounded" /></td>
                    <td className="px-4 py-3"><div className="h-4 w-20 bg-neutral-100 animate-pulse rounded" /></td>
                    <td className="px-4 py-3"><div className="h-4 w-20 bg-neutral-100 animate-pulse rounded" /></td>
                  </tr>
                ))
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <div className="w-16 h-16 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto mb-4">
                      <Icon name="user" size="lg" className="text-neutral-400" />
                    </div>
                    <p className="text-neutral-500 font-medium">Không tìm thấy user nào</p>
                    <p className="text-sm text-neutral-400 mt-1">
                      {search ? 'Thử tìm với từ khóa khác' : 'Chưa có user nào'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-xs font-medium text-primary-600">
                            {(user.name || user.email)[0].toUpperCase()}
                          </span>
                        </div>
                        <span className="font-medium text-neutral-900">
                          {user.name || 'No name'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-neutral-600">{user.email}</td>
                    <td className="px-4 py-3">
                      <Badge variant={user.role === 'admin' ? 'warning' : 'default'} size="sm">
                        {user.role}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={user.isActive ? 'success' : 'danger'} size="sm" dot>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-neutral-500 text-sm">
                      {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString('vi-VN') : '-'}
                    </td>
                    <td className="px-4 py-3 text-neutral-500 text-sm">
                      {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
