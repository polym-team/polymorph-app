'use client';

import { useCallback, useRef, useState } from 'react';
import type { Block } from '@blocknote/core';
import type { OKRStatus } from './types';
import { BlockNoteEditor } from './BlockNoteEditor';
import { CollaborativeEditor } from './CollaborativeEditor';

interface OKRProgressSectionProps {
  spaceId: string;
  okrId: string;
  okrStatus: OKRStatus;
  initialContent: Block[] | null;
  userName: string;
  userColor: string;
}

export function OKRProgressSection({
  spaceId,
  okrId,
  okrStatus,
  initialContent,
  userName,
  userColor,
}: OKRProgressSectionProps) {
  const [isSaving, setIsSaving] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isActive = okrStatus === 'ACTIVE';
  const isVisible = okrStatus !== 'PLANNING';

  const handleJsonSync = useCallback(
    (blocks: Block[]) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(async () => {
        setIsSaving(true);
        try {
          await fetch(`/api/spaces/${spaceId}/okrs/${okrId}/progress`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: blocks }),
          });
        } finally {
          setIsSaving(false);
        }
      }, 1000);
    },
    [spaceId, okrId]
  );

  if (!isVisible) return null;

  return (
    <section>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">진행 기록</h2>
        {isSaving && (
          <span className="text-xs text-gray-400">저장 중...</span>
        )}
      </div>
      <div className="mt-3 overflow-hidden rounded-lg border border-gray-200">
        {isActive ? (
          <CollaborativeEditor
            spaceId={spaceId}
            okrId={okrId}
            initialContent={initialContent}
            onChange={handleJsonSync}
            userName={userName}
            userColor={userColor}
          />
        ) : (
          <BlockNoteEditor
            initialContent={initialContent ?? undefined}
            editable={false}
          />
        )}
      </div>
    </section>
  );
}
