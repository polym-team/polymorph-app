'use client';

import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@package/ui';
import type { ObjectiveData, OKRStatus, SpaceMember } from './types';
import { ObjectiveForm } from './ObjectiveForm';
import { TaskList } from './TaskList';

interface ObjectiveItemProps {
  objective: ObjectiveData;
  spaceId: string;
  okrId: string;
  okrStatus: OKRStatus;
  currentUserId: string;
  spaceMembers: SpaceMember[];
  onMutate: () => void;
}

export function ObjectiveItem({
  objective,
  spaceId,
  okrId,
  okrStatus,
  currentUserId,
  spaceMembers,
  onMutate,
}: ObjectiveItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isPlanning = okrStatus === 'PLANNING';

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: objective.id, disabled: !isPlanning || isEditing });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleDelete = async () => {
    if (!confirm('이 목표를 삭제하시겠습니까? 하위 작업도 모두 삭제됩니다.')) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/spaces/${spaceId}/okrs/${okrId}/objectives/${objective.id}`, {
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
        <ObjectiveForm
          objective={objective}
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
    <div ref={setNodeRef} style={style} className="rounded-lg border bg-white p-4">
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
            <h3 className="font-medium text-gray-900">{objective.title}</h3>
            <div className="flex shrink-0 items-center gap-1">
              <div className="flex items-center gap-1.5">
                {objective.owner.avatarUrl ? (
                  <img
                    src={objective.owner.avatarUrl}
                    alt={objective.owner.name}
                    className="h-5 w-5 rounded-full"
                  />
                ) : (
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-200 text-[9px] font-medium text-gray-600">
                    {objective.owner.name.charAt(0)}
                  </div>
                )}
                <span className="text-xs text-gray-400">{objective.owner.name}</span>
              </div>
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
          {objective.description && (
            <p className="mt-1 text-sm text-gray-500">{objective.description}</p>
          )}
        </div>
      </div>

      <TaskList
        tasks={objective.tasks}
        spaceId={spaceId}
        okrId={okrId}
        objectiveId={objective.id}
        okrStatus={okrStatus}
        currentUserId={currentUserId}
        spaceMembers={spaceMembers}
      />
    </div>
  );
}
