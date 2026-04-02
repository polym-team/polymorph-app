'use client';

import { useEffect, useState } from 'react';
import type { User } from '@/types';

const ROLE_LABELS: Record<string, { text: string; color: string }> = {
  pending: { text: '승인대기', color: 'bg-yellow-100 text-yellow-800' },
  user: { text: '일반', color: 'bg-green-100 text-green-800' },
  admin: { text: '관리자', color: 'bg-blue-100 text-blue-800' },
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = () => {
    fetch('/api/users')
      .then((r) => r.json())
      .then((data) => {
        setUsers(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: number, role: string) => {
    await fetch('/api/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, role }),
    });
    fetchUsers();
  };

  if (loading) return <div className="text-center py-12 text-gray-500">로딩 중...</div>;

  const pendingUsers = users.filter((u) => u.role === 'pending');
  const activeUsers = users.filter((u) => u.role !== 'pending');

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">사용자 관리</h1>

      {pendingUsers.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-medium text-yellow-700 mb-2">
            승인 대기 ({pendingUsers.length})
          </h2>
          <div className="bg-white rounded border divide-y">
            {pendingUsers.map((user) => (
              <div key={user.id} className="p-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-gray-400">{user.email}</p>
                </div>
                <button
                  onClick={() => handleRoleChange(user.id, 'user')}
                  className="text-xs bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                >
                  승인
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <h2 className="text-sm font-medium text-gray-500 mb-2">활성 사용자 ({activeUsers.length})</h2>
      <div className="bg-white rounded border divide-y">
        {activeUsers.map((user) => {
          const roleInfo = ROLE_LABELS[user.role];
          return (
            <div key={user.id} className="p-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-gray-400">{user.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded ${roleInfo.color}`}>
                  {roleInfo.text}
                </span>
                {user.role === 'user' && (
                  <button
                    onClick={() => handleRoleChange(user.id, 'pending')}
                    className="text-xs text-red-500"
                  >
                    비활성화
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
