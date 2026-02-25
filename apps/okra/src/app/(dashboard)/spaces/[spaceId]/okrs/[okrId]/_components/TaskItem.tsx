'use client';

import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Badge, Button } from '@package/ui';
import type { TaskData, OKRStatus, SpaceMember } from './types';
import { TaskForm } from './TaskForm';

const TASK_STATUS_CONFIG: Record<string, { label: string; variant: 'secondary' | 'success' | 'warning' | 'default' }> = {
  TODO: { label: '할 일', variant: 'secondary' },
  IN_PROGRESS: { label: '진행 중', variant: 'warning' },
  DONE: { label: '완료', variant: 'success' },
  DISCARDED: { label: '제외', variant: 'default' },
};

interface TaskItemProps {
  task: TaskData;
  spaceId: string;
  okrId: string;
  objectiveId: string;
  okrStatus: OKRStatus;
  currentUserId: string;
  spaceMembers: SpaceMember[];
  onMutate: () => void;
}

export function TaskItem({
  task,
  spaceId,
  okrId,
  objectiveId,
  okrStatus,
  currentUserId,
  spaceMembers,
  onMutate,
}: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDiscarding, setIsDiscarding] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isPlanning = okrStatus === 'PLANNING';
  const isActive = okrStatus === 'ACTIVE';

  const canDiscard =
    isActive &&
    task.status !== 'DISCARDED' &&
    (task.assigneeMode === 'ANYONE' || task.assignee?.id === currentUserId);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, disabled: !isPlanning || isEditing });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleDiscard = async () => {
    if (!confirm('이 작업을 폐기하시겠습니까?')) return;
    setIsDiscarding(true);
    try {
      const res = await fetch(
        `/api/spaces/${spaceId}/okrs/${okrId}/objectives/${objectiveId}/tasks/${task.id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'DISCARDED' }),
        }
      );
      if (res.ok) onMutate();
    } finally {
      setIsDiscarding(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('이 작업을 삭제하시겠습니까?')) return;
    setIsDeleting(true);
    try {
      const res = await fetch(
        `/api/spaces/${spaceId}/okrs/${okrId}/objectives/${objectiveId}/tasks/${task.id}`,
        { method: 'DELETE' }
      );
      if (res.ok) onMutate();
    } finally {
      setIsDeleting(false);
    }
  };

  if (isEditing) {
    return (
      <li ref={setNodeRef} style={style}>
        <TaskForm
          task={task}
          spaceId={spaceId}
          okrId={okrId}
          objectiveId={objectiveId}
          spaceMembers={spaceMembers}
          onSave={() => {
            setIsEditing(false);
            onMutate();
          }}
          onCancel={() => setIsEditing(false)}
        />
      </li>
    );
  }

  const statusConfig = TASK_STATUS_CONFIG[task.status] || { label: task.status, variant: 'default' as const };

  return (
    <li ref={setNodeRef} style={style} className="flex items-center gap-2">
      {isPlanning && (
        <button
          type="button"
          className="shrink-0 cursor-grab touch-none text-gray-400 hover:text-gray-600"
          {...attributes}
          {...listeners}
        >
          ⠿
        </button>
      )}
      <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
      <span className="min-w-0 flex-1 truncate text-sm text-gray-700">{task.title}</span>
      {task.assignee && (
        <span className="shrink-0 text-xs text-gray-400">{task.assignee.name}</span>
      )}
      {task.dueDate && (
        <span className="shrink-0 text-xs text-gray-400">
          {new Date(task.dueDate).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
        </span>
      )}
      {task._count.progress > 0 && (
        <span className="shrink-0 text-xs text-gray-400">기록 {task._count.progress}</span>
      )}
      {isPlanning && (
        <>
          <Button variant="ghost" onClick={() => setIsEditing(true)}>
            수정
          </Button>
          <Button variant="ghost" onClick={handleDelete} disabled={isDeleting}>
            삭제
          </Button>
        </>
      )}
      {canDiscard && (
        <Button variant="ghost" onClick={handleDiscard} disabled={isDiscarding}>
          {isDiscarding ? '폐기 중...' : '폐기'}
        </Button>
      )}
    </li>
  );
}
