'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@package/ui';
import { OKRStatusBadge } from '../../../_components/OKRStatusBadge';

const NEXT_STATUS: Record<string, { value: string; label: string; confirm: string }> = {
  PLANNING: {
    value: 'ACTIVE',
    label: '진행 시작',
    confirm: '목표수립을 마치고 진행 단계로 전환하시겠습니까?\n전환 후에는 아이디어/목표를 수정할 수 없습니다.',
  },
  ACTIVE: {
    value: 'REVIEW',
    label: '회고 시작',
    confirm: '진행을 마치고 회고 단계로 전환하시겠습니까?\n전환 후에는 진행 기록을 추가할 수 없습니다.',
  },
  REVIEW: {
    value: 'ARCHIVED',
    label: '아카이브',
    confirm: '회고를 마치고 아카이브하시겠습니까?\n아카이브 후에는 모든 내용이 읽기 전용이 됩니다.',
  },
};

const ABORT_STATUS: Record<string, { value: string; label: string; confirm: string }> = {
  ACTIVE: {
    value: 'REVIEW',
    label: '중단',
    confirm: 'OKR을 중단하고 회고 단계로 전환하시겠습니까?\n중단 사유는 회고에 기록해 주세요.',
  },
};

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
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isAborting, setIsAborting] = useState(false);

  const nextStatus = NEXT_STATUS[okr.status];
  const abortStatus = ABORT_STATUS[okr.status];
  const canDelete = okr.status === 'PLANNING';

  const handleDelete = async () => {
    if (!confirm('이 OKR을 삭제하시겠습니까? 하위 데이터가 모두 삭제됩니다.')) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/spaces/${spaceId}/okrs/${okr.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        router.push(`/spaces/${spaceId}`);
      } else {
        const data = await res.json();
        alert(data.error ?? '삭제에 실패했습니다.');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleStatusTransition = async () => {
    if (!nextStatus) return;
    if (!confirm(nextStatus.confirm)) return;

    setIsTransitioning(true);
    try {
      const res = await fetch(`/api/spaces/${spaceId}/okrs/${okr.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus.value }),
      });

      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error ?? '상태 전환에 실패했습니다.');
      }
    } finally {
      setIsTransitioning(false);
    }
  };

  const handleAbort = async () => {
    if (!abortStatus) return;
    if (!confirm(abortStatus.confirm)) return;

    setIsAborting(true);
    try {
      const res = await fetch(`/api/spaces/${spaceId}/okrs/${okr.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: abortStatus.value }),
      });

      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error ?? '중단에 실패했습니다.');
      }
    } finally {
      setIsAborting(false);
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
          <div className="flex shrink-0 gap-2">
            {abortStatus && (
              <Button
                variant="outline"
                onClick={handleAbort}
                disabled={isAborting}
              >
                {isAborting ? '중단 중...' : abortStatus.label}
              </Button>
            )}
            {nextStatus && (
              <Button
                onClick={handleStatusTransition}
                disabled={isTransitioning}
              >
                {isTransitioning ? '전환 중...' : nextStatus.label}
              </Button>
            )}
            {canDelete && (
              <Button
                variant="danger"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? '삭제 중...' : '삭제'}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
