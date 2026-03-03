'use client';

import { useCallback, useRef, useState } from 'react';
import type { Block } from '@blocknote/core';
import type { OKRStatus, ReviewData } from './types';
import { BlockNoteEditor } from './BlockNoteEditor';

interface OKRReviewSectionProps {
  reviews: ReviewData[];
  okrStatus: OKRStatus;
  spaceId: string;
  okrId: string;
  currentUserId: string;
  isOwner: boolean;
}

export function OKRReviewSection({
  reviews: initialReviews,
  okrStatus,
  spaceId,
  okrId,
  currentUserId,
  isOwner,
}: OKRReviewSectionProps) {
  const [reviews, setReviews] = useState<ReviewData[]>(initialReviews);
  const [isSaving, setIsSaving] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isVisible = okrStatus === 'REVIEW' || okrStatus === 'ARCHIVED';
  const isEditable = okrStatus === 'REVIEW';

  const myReview = reviews.find((r) => r.author.id === currentUserId);
  const otherReviews = reviews.filter((r) => r.author.id !== currentUserId);

  const handleCreate = useCallback(async () => {
    setIsCreating(true);
    try {
      const res = await fetch(`/api/spaces/${spaceId}/okrs/${okrId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: [] }),
      });
      if (res.ok) {
        const review = await res.json();
        setReviews((prev) => [review, ...prev]);
      }
    } finally {
      setIsCreating(false);
    }
  }, [spaceId, okrId]);

  const handleChange = useCallback(
    (reviewId: string, blocks: Block[]) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(async () => {
        setIsSaving(true);
        try {
          await fetch(
            `/api/spaces/${spaceId}/okrs/${okrId}/reviews/${reviewId}`,
            {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ content: blocks }),
            }
          );
        } finally {
          setIsSaving(false);
        }
      }, 1000);
    },
    [spaceId, okrId]
  );

  const handleDelete = useCallback(
    async (reviewId: string) => {
      if (!confirm('회고를 삭제하시겠습니까?')) return;

      const res = await fetch(
        `/api/spaces/${spaceId}/okrs/${okrId}/reviews/${reviewId}`,
        { method: 'DELETE' }
      );
      if (res.ok) {
        setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      }
    },
    [spaceId, okrId]
  );

  if (!isVisible) return null;

  return (
    <section>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">회고</h2>
        {isSaving && (
          <span className="text-xs text-gray-400">저장 중...</span>
        )}
      </div>

      <div className="mt-3 space-y-4">
        {/* My review */}
        {isOwner && isEditable && !myReview && (
          <button
            onClick={handleCreate}
            disabled={isCreating}
            className="w-full rounded-lg border-2 border-dashed border-gray-300 px-4 py-6 text-sm text-gray-500 transition-colors hover:border-gray-400 hover:text-gray-700 disabled:opacity-50"
          >
            {isCreating ? '생성 중...' : '회고 작성하기'}
          </button>
        )}

        {myReview && (
          <div className="rounded-lg border border-gray-200">
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-2">
              <div className="flex items-center gap-2">
                {myReview.author.avatarUrl ? (
                  <img
                    src={myReview.author.avatarUrl}
                    alt={myReview.author.name}
                    className="h-6 w-6 rounded-full"
                  />
                ) : (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-xs font-medium text-gray-600">
                    {myReview.author.name[0]}
                  </div>
                )}
                <span className="text-sm font-medium text-gray-900">
                  {myReview.author.name}
                </span>
                <span className="text-xs text-gray-400">내 회고</span>
              </div>
              {isEditable && (
                <button
                  onClick={() => handleDelete(myReview.id)}
                  className="text-xs text-red-500 hover:text-red-700"
                >
                  삭제
                </button>
              )}
            </div>
            <BlockNoteEditor
              initialContent={
                Array.isArray(myReview.content) && myReview.content.length > 0
                  ? myReview.content
                  : undefined
              }
              onChange={
                isEditable
                  ? (blocks) => handleChange(myReview.id, blocks)
                  : undefined
              }
              editable={isEditable}
            />
          </div>
        )}

        {/* Other reviews */}
        {otherReviews.map((review) => (
          <div key={review.id} className="rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-2">
              {review.author.avatarUrl ? (
                <img
                  src={review.author.avatarUrl}
                  alt={review.author.name}
                  className="h-6 w-6 rounded-full"
                />
              ) : (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-xs font-medium text-gray-600">
                  {review.author.name[0]}
                </div>
              )}
              <span className="text-sm font-medium text-gray-900">
                {review.author.name}
              </span>
              <span className="text-xs text-gray-400">
                {new Date(review.createdAt).toLocaleDateString('ko-KR')}
              </span>
            </div>
            <BlockNoteEditor
              initialContent={
                Array.isArray(review.content) && review.content.length > 0
                  ? review.content
                  : undefined
              }
              editable={false}
            />
          </div>
        ))}

        {reviews.length === 0 && (
          <p className="py-4 text-center text-sm text-gray-400">
            아직 작성된 회고가 없습니다.
          </p>
        )}
      </div>
    </section>
  );
}
