'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@package/ui';
import { OKRStatusBadge } from '../../../_components/OKRStatusBadge';

interface OKRDetailHeaderProps {
  okr: {
    id: string;
    title: string;
    description: string | null;
    status: string;
    startDate: Date | null;
    endDate: Date | null;
  };
  spaceId: string;
  isOwner: boolean;
}

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function OKRDetailHeader({ okr, spaceId, isOwner }: OKRDetailHeaderProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm('이 OKR을 삭제하시겠습니까? 하위 데이터가 모두 삭제됩니다.')) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/spaces/${spaceId}/okrs/${okr.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        router.push(`/spaces/${spaceId}`);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900">{okr.title}</h1>
            <OKRStatusBadge status={okr.status} />
          </div>
          {okr.description && (
            <p className="mt-2 text-gray-500">{okr.description}</p>
          )}
          {(okr.startDate || okr.endDate) && (
            <p className="mt-2 text-sm text-gray-400">
              {okr.startDate && formatDate(okr.startDate)}
              {okr.startDate && okr.endDate && ' ~ '}
              {okr.endDate && formatDate(okr.endDate)}
            </p>
          )}
        </div>

        {isOwner && (
          <Button
            variant="danger"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? '삭제 중...' : '삭제'}
          </Button>
        )}
      </div>
    </div>
  );
}
