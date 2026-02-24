'use client';

import { Badge } from '@package/ui';

interface Member {
  id: string;
  role: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
  };
}

const ROLE_LABELS: Record<string, string> = {
  OWNER: 'Owner',
  ADMIN: 'Admin',
  MEMBER: 'Member',
};

const ROLE_VARIANTS: Record<string, 'default' | 'secondary' | 'outline'> = {
  OWNER: 'default',
  ADMIN: 'secondary',
  MEMBER: 'outline',
};

export function MemberList({ members }: { members: Member[] }) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900">멤버 ({members.length})</h2>
      <ul className="mt-3 divide-y divide-gray-100">
        {members.map((member) => (
          <li key={member.id} className="flex items-center gap-3 py-3">
            {member.user.avatarUrl ? (
              <img
                src={member.user.avatarUrl}
                alt={member.user.name}
                className="h-8 w-8 rounded-full"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-sm font-medium text-gray-600">
                {member.user.name.charAt(0)}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-900">{member.user.name}</p>
              <p className="truncate text-xs text-gray-500">{member.user.email}</p>
            </div>
            <Badge variant={ROLE_VARIANTS[member.role] || 'outline'}>
              {ROLE_LABELS[member.role] || member.role}
            </Badge>
          </li>
        ))}
      </ul>
    </div>
  );
}
