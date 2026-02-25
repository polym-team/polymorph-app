'use client';

import { useState } from 'react';
import { Button, Input } from '@package/ui';
import type { IdeaData } from './types';

interface IdeaFormProps {
  idea?: IdeaData;
  spaceId: string;
  okrId: string;
  onSave: () => void;
  onCancel: () => void;
}

export function IdeaForm({ idea, spaceId, okrId, onSave, onCancel }: IdeaFormProps) {
  const [title, setTitle] = useState(idea?.title ?? '');
  const [description, setDescription] = useState(idea?.description ?? '');
  const [category, setCategory] = useState(idea?.category ?? '');
  const [isSaving, setIsSaving] = useState(false);

  const isEdit = !!idea;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSaving(true);
    try {
      const url = isEdit
        ? `/api/spaces/${spaceId}/okrs/${okrId}/ideas/${idea.id}`
        : `/api/spaces/${spaceId}/okrs/${okrId}/ideas`;
      const method = isEdit ? 'PATCH' : 'POST';

      const body: Record<string, unknown> = { title: title.trim() };
      if (description.trim()) body.description = description.trim();
      else if (isEdit) body.description = null;
      if (category.trim()) body.category = category.trim();
      else if (isEdit) body.category = null;

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
        placeholder="아이디어 제목"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        autoFocus
      />
      <Input
        placeholder="설명 (선택)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <Input
        placeholder="카테고리 (선택)"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
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
