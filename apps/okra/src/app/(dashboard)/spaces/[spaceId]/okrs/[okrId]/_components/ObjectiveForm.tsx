'use client';

import { useState } from 'react';
import { Button, Input } from '@package/ui';
import type { ObjectiveData, SpaceMember } from './types';

interface ObjectiveFormProps {
  objective?: ObjectiveData;
  spaceId: string;
  okrId: string;
  spaceMembers?: SpaceMember[];
  onSave: () => void;
  onCancel: () => void;
}

export function ObjectiveForm({ objective, spaceId, okrId, spaceMembers, onSave, onCancel }: ObjectiveFormProps) {
  const [title, setTitle] = useState(objective?.title ?? '');
  const [description, setDescription] = useState(objective?.description ?? '');
  const [selectedAssigneeIds, setSelectedAssigneeIds] = useState<string[]>(
    objective?.assignees?.map((a) => a.user.id) ?? [],
  );
  const [isSaving, setIsSaving] = useState(false);

  const isEdit = !!objective;

  const toggleAssignee = (userId: string) => {
    setSelectedAssigneeIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSaving(true);
    try {
      const url = isEdit
        ? `/api/spaces/${spaceId}/okrs/${okrId}/objectives/${objective.id}`
        : `/api/spaces/${spaceId}/okrs/${okrId}/objectives`;
      const method = isEdit ? 'PATCH' : 'POST';

      const body: Record<string, unknown> = { title: title.trim() };
      if (description.trim()) body.description = description.trim();
      else if (isEdit) body.description = null;

      if (selectedAssigneeIds.length > 0) {
        body.assigneeIds = selectedAssigneeIds;
      }

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
    <form onSubmit={handleSubmit} className="space-y-3 rounded-lg border bg-white p-4">
      <Input
        placeholder="목표 제목"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        autoFocus
      />
      <Input
        placeholder="설명 (선택)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      {spaceMembers && spaceMembers.length > 0 && (
        <div>
          <p className="mb-1.5 text-sm font-medium text-gray-700">담당자</p>
          <div className="flex flex-wrap gap-2">
            {spaceMembers.map((m) => {
              const selected = selectedAssigneeIds.includes(m.user.id);
              return (
                <button
                  key={m.user.id}
                  type="button"
                  onClick={() => toggleAssignee(m.user.id)}
                  className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors ${
                    selected
                      ? 'border-blue-300 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {m.user.avatarUrl ? (
                    <img src={m.user.avatarUrl} alt={m.user.name} className="h-4 w-4 rounded-full" />
                  ) : (
                    <div className="flex h-4 w-4 items-center justify-center rounded-full bg-gray-200 text-[8px] font-medium">
                      {m.user.name.charAt(0)}
                    </div>
                  )}
                  {m.user.name}
                </button>
              );
            })}
          </div>
          <p className="mt-1 text-xs text-gray-400">
            미선택 시 작성자가 자동 배정됩니다
          </p>
        </div>
      )}
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
