import Link from 'next/link';
import { Badge } from '@package/ui';

interface SpaceCardProps {
  id: string;
  name: string;
  description?: string | null;
  iconEmoji?: string | null;
  memberCount: number;
  myRole?: string;
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

export function SpaceCard({ id, name, description, iconEmoji, memberCount, myRole }: SpaceCardProps) {
  return (
    <Link
      href={`/spaces/${id}`}
      className="block rounded-lg border bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-start gap-3">
        <span className="text-3xl">{iconEmoji || '🎯'}</span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate font-semibold text-gray-900">{name}</h3>
            {myRole && (
              <Badge variant={ROLE_VARIANTS[myRole] || 'outline'}>{ROLE_LABELS[myRole] || myRole}</Badge>
            )}
          </div>
          {description && <p className="mt-1 truncate text-sm text-gray-500">{description}</p>}
          <p className="mt-2 text-xs text-gray-400">{memberCount}명의 멤버</p>
        </div>
      </div>
    </Link>
  );
}
