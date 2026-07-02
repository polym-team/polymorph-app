'use client';

import { useEffect, useState } from 'react';
import type { User } from '@/types';
import { PageHeader, SectionCard, Button, StatusBadge } from '@/components/ui';
import { ROLE_STATUS } from '@/lib/status';

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

  if (loading) return <div className="text-center py-12 text-ink-600">로딩 중...</div>;

  const pendingUsers = users.filter((u) => u.role === 'pending');
  const activeUsers = users.filter((u) => u.role !== 'pending');

  return (
    <div>
      <PageHeader title="사용자 관리" />

      {pendingUsers.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-medium text-ocher-600 mb-2">
            승인 대기 ({pendingUsers.length})
          </h2>
          <SectionCard className="divide-y divide-line">
            {pendingUsers.map((user) => (
              <div key={user.id} className="p-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-ink-900">{user.name}</p>
                  <p className="text-xs text-ink-400">{user.email}</p>
                </div>
                <Button variant="accent" size="sm" onClick={() => handleRoleChange(user.id, 'user')}>
                  승인
                </Button>
              </div>
            ))}
          </SectionCard>
        </div>
      )}

      <h2 className="text-sm font-medium text-ink-600 mb-2">활성 사용자 ({activeUsers.length})</h2>
      <SectionCard className="divide-y divide-line">
        {activeUsers.map((user) => (
          <div key={user.id} className="p-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-ink-900">{user.name}</p>
              <p className="text-xs text-ink-400">{user.email}</p>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={ROLE_STATUS[user.role]} />
              {user.role === 'user' && (
                <button
                  onClick={() => handleRoleChange(user.id, 'pending')}
                  className="text-xs text-ink-400 hover:text-terra-600 transition-colors"
                >
                  비활성화
                </button>
              )}
            </div>
          </div>
        ))}
      </SectionCard>
    </div>
  );
}
