'use client';

import { useState } from 'react';
import { Button, Input } from '@package/ui';
import type { TaskData, SpaceMember } from './types';

interface TaskFormProps {
  task?: TaskData;
  spaceId: string;
  okrId: string;
  objectiveId: string;
  spaceMembers: SpaceMember[];
  onSave: () => void;
  onCancel: () => void;
}

export function TaskForm({ task, spaceId, okrId, objectiveId, spaceMembers, onSave, onCancel }: TaskFormProps) {
  const [title, setTitle] = useState(task?.title ?? '');
  const [description, setDescription] = useState(task?.description ?? '');
  const [assigneeMode, setAssigneeMode] = useState(task?.assigneeMode ?? 'ANYONE');
  const [assigneeId, setAssigneeId] = useState(task?.assignee?.id ?? '');
  const [dueDate, setDueDate] = useState(() => {
    if (!task?.dueDate) return '';
    const d = task.dueDate instanceof Date ? task.dueDate : new Date(task.dueDate);
    return d.toISOString().slice(0, 10);
  });
  const [isSaving, setIsSaving] = useState(false);

  const isEdit = !!task;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSaving(true);
    try {
      const url = isEdit
        ? `/api/spaces/${spaceId}/okrs/${okrId}/objectives/${objectiveId}/tasks/${task.id}`
        : `/api/spaces/${spaceId}/okrs/${okrId}/objectives/${objectiveId}/tasks`;
      const method = isEdit ? 'PATCH' : 'POST';

      const body: Record<string, unknown> = { title: title.trim(), assigneeMode };
      if (description.trim()) body.description = description.trim();
      else if (isEdit) body.description = null;
      if (assigneeMode === 'ASSIGNED' && assigneeId) body.assigneeId = assigneeId;
      else body.assigneeId = null;
      if (dueDate) body.dueDate = new Date(dueDate).toISOString();
      else if (isEdit) body.dueDate = null;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        onSave();
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-lg border bg-gray-50 p-3">
      <Input
        placeholder="작업 제목"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        autoFocus
      />
      <Input
        placeholder="설명 (선택)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <div className="flex flex-wrap gap-2">
        <select
          value={assigneeMode}
          onChange={(e) => {
            setAssigneeMode(e.target.value);
            if (e.target.value === 'ANYONE') setAssigneeId('');
          }}
          className="h-10 rounded border border-gray-200 px-3 text-sm"
        >
          <option value="ANYONE">누구나</option>
          <option value="ASSIGNED">담당자 지정</option>
        </select>
        {assigneeMode === 'ASSIGNED' && (
          <select
            value={assigneeId}
            onChange={(e) => setAssigneeId(e.target.value)}
            className="h-10 flex-1 rounded border border-gray-200 px-3 text-sm"
          >
            <option value="">담당자 선택...</option>
            {spaceMembers.map((m) => (
              <option key={m.user.id} value={m.user.id}>
                {m.user.name}
              </option>
            ))}
          </select>
        )}
        <Input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="w-40"
          placeholder="기한"
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={isSaving}>
          취소
        </Button>
        <Button type="submit" disabled={!title.trim() || isSaving}>
          {isSaving ? '저장 중...' : isEdit ? '수정' : '추가'}
        </Button>
      </div>
    </form>
  );
}
