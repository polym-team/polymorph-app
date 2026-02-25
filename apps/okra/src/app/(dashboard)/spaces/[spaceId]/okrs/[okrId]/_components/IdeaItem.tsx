'use client';

import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@package/ui';
import type { IdeaData } from './types';
import { IdeaForm } from './IdeaForm';

interface IdeaItemProps {
  idea: IdeaData;
  spaceId: string;
  okrId: string;
  isPlanning: boolean;
  onMutate: () => void;
}

export function IdeaItem({ idea, spaceId, okrId, isPlanning, onMutate }: IdeaItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: idea.id, disabled: !isPlanning || isEditing });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleDelete = async () => {
    if (!confirm('이 아이디어를 삭제하시겠습니까?')) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/spaces/${spaceId}/okrs/${okrId}/ideas/${idea.id}`, {
        method: 'DELETE',
      });
      if (res.ok) onMutate();
    } finally {
      setIsDeleting(false);
    }
  };

  if (isEditing) {
    return (
      <div ref={setNodeRef} style={style}>
        <IdeaForm
          idea={idea}
          spaceId={spaceId}
          okrId={okrId}
          onSave={() => {
            setIsEditing(false);
            onMutate();
          }}
          onCancel={() => setIsEditing(false)}
        />
      </div>
    );
  }

  return (
    <li ref={setNodeRef} style={style} className="rounded-lg border bg-white p-4">
      <div className="flex items-start gap-2">
        {isPlanning && (
          <button
            type="button"
            className="mt-0.5 shrink-0 cursor-grab touch-none text-gray-400 hover:text-gray-600"
            {...attributes}
            {...listeners}
          >
            ⠿
          </button>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-medium text-gray-900">{idea.title}</h3>
            <div className="flex shrink-0 items-center gap-1">
              {idea.category && (
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                  {idea.category}
                </span>
              )}
              {isPlanning && (
                <>
                  <Button variant="ghost" onClick={() => setIsEditing(true)}>
                    수정
                  </Button>
                  <Button variant="ghost" onClick={handleDelete} disabled={isDeleting}>
                    {isDeleting ? '삭제 중...' : '삭제'}
                  </Button>
                </>
              )}
            </div>
          </div>
          {idea.description && (
            <p className="mt-1 text-sm text-gray-500">{idea.description}</p>
          )}
          <div className="mt-2 flex items-center gap-1.5">
            {idea.author.avatarUrl ? (
              <img
                src={idea.author.avatarUrl}
                alt={idea.author.name}
                className="h-4 w-4 rounded-full"
              />
            ) : (
              <div className="flex h-4 w-4 items-center justify-center rounded-full bg-gray-200 text-[8px] font-medium text-gray-600">
                {idea.author.name.charAt(0)}
              </div>
            )}
            <span className="text-xs text-gray-400">{idea.author.name}</span>
          </div>
        </div>
      </div>
    </li>
  );
}
