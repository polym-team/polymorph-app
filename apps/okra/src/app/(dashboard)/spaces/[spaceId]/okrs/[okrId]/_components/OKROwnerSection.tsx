'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@package/ui';

interface Owner {
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
  };
}

interface SpaceMember {
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
  };
}

interface OKROwnerSectionProps {
  okr: {
    id: string;
    status: string;
    owners: Owner[];
  };
  spaceId: string;
  isOwner: boolean;
  spaceMembers: SpaceMember[];
}

export function OKROwnerSection({ okr, spaceId, isOwner, spaceMembers }: OKROwnerSectionProps) {
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [removingUserId, setRemovingUserId] = useState<string | null>(null);

  const isArchived = okr.status === 'ARCHIVED';
  const ownerIds = new Set(okr.owners.map((o) => o.user.id));
  const addableMembers = spaceMembers.filter((m) => !ownerIds.has(m.user.id));

  const handleAddOwner = async () => {
    if (!selectedUserId) return;
    setIsAdding(true);
    try {
      const res = await fetch(`/api/spaces/${spaceId}/okrs/${okr.id}/owners`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedUserId }),
      });

      if (res.ok) {
        setSelectedUserId('');
        router.refresh();
      }
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveOwner = async (userId: string) => {
    if (!confirm('이 Owner를 제거하시겠습니까?')) return;
    setRemovingUserId(userId);
    try {
      const res = await fetch(`/api/spaces/${spaceId}/okrs/${okr.id}/owners/${userId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        router.refresh();
      }
    } finally {
      setRemovingUserId(null);
    }
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900">Owner ({okr.owners.length})</h2>

      <ul className="mt-3 divide-y divide-gray-100">
        {okr.owners.map((owner) => (
          <li key={owner.user.id} className="flex items-center gap-3 py-3">
            {owner.user.avatarUrl ? (
              <img
                src={owner.user.avatarUrl}
                alt={owner.user.name}
                className="h-8 w-8 rounded-full"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-sm font-medium text-gray-600">
                {owner.user.name.charAt(0)}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-900">{owner.user.name}</p>
              <p className="truncate text-xs text-gray-500">{owner.user.email}</p>
            </div>
            {isOwner && !isArchived && okr.owners.length > 1 && (
              <Button
                variant="ghost"
                onClick={() => handleRemoveOwner(owner.user.id)}
                disabled={removingUserId === owner.user.id}
              >
                {removingUserId === owner.user.id ? '제거 중...' : '제거'}
              </Button>
            )}
          </li>
        ))}
      </ul>

      {isOwner && !isArchived && addableMembers.length > 0 && (
        <div className="mt-4 flex items-center gap-2">
          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="h-10 flex-1 rounded border border-gray-200 px-3 text-sm"
          >
            <option value="">멤버 선택...</option>
            {addableMembers.map((m) => (
              <option key={m.user.id} value={m.user.id}>
                {m.user.name} ({m.user.email})
              </option>
            ))}
          </select>
          <Button
            onClick={handleAddOwner}
            disabled={!selectedUserId || isAdding}
          >
            {isAdding ? '추가 중...' : 'Owner 추가'}
          </Button>
        </div>
      )}
    </div>
  );
}
