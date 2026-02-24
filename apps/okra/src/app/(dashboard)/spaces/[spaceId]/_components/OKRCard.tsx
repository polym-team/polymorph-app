'use client';

import Link from 'next/link';
import { OKRStatusBadge } from './OKRStatusBadge';

interface OKROwner {
  user: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
}

interface OKRCardProps {
  id: string;
  spaceId: string;
  title: string;
  description: string | null;
  status: string;
  startDate: string | null;
  endDate: string | null;
  owners: OKROwner[];
  _count: { objectives: number; ideas: number };
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
}

export function OKRCard({ id, spaceId, title, description, status, startDate, endDate, owners, _count }: OKRCardProps) {
  return (
    <Link
      href={`/spaces/${spaceId}/okrs/${id}`}
      className="block rounded-lg border bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="truncate font-semibold text-gray-900">{title}</h3>
        <OKRStatusBadge status={status} />
      </div>

      {description && (
        <p className="mt-2 line-clamp-2 text-sm text-gray-500">{description}</p>
      )}

      {(startDate || endDate) && (
        <p className="mt-2 text-xs text-gray-400">
          {startDate && formatDate(startDate)}
          {startDate && endDate && ' ~ '}
          {endDate && formatDate(endDate)}
        </p>
      )}

      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <span>목표 {_count.objectives}</span>
          <span>·</span>
          <span>아이디어 {_count.ideas}</span>
        </div>

        <div className="flex -space-x-1.5">
          {owners.slice(0, 3).map((owner) => (
            owner.user.avatarUrl ? (
              <img
                key={owner.user.id}
                src={owner.user.avatarUrl}
                alt={owner.user.name}
                className="h-6 w-6 rounded-full border-2 border-white"
              />
            ) : (
              <div
                key={owner.user.id}
                className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-gray-200 text-[10px] font-medium text-gray-600"
              >
                {owner.user.name.charAt(0)}
              </div>
            )
          ))}
          {owners.length > 3 && (
            <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-gray-100 text-[10px] font-medium text-gray-500">
              +{owners.length - 3}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
