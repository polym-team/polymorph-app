'use client';

import { useState } from 'react';
import { Button, Input } from '@package/ui';
import type { ObjectiveData } from './types';

interface ObjectiveFormProps {
  objective?: ObjectiveData;
  spaceId: string;
  okrId: string;
  onSave: () => void;
  onCancel: () => void;
}

export function ObjectiveForm({ objective, spaceId, okrId, onSave, onCancel }: ObjectiveFormProps) {
  const [title, setTitle] = useState(objective?.title ?? '');
  const [description, setDescription] = useState(objective?.description ?? '');
  const [isSaving, setIsSaving] = useState(false);

  const isEdit = !!objective;

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
