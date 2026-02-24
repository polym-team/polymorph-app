'use client';

import { useState } from 'react';
import { Button, Input } from '@package/ui';

interface OKRFormProps {
  spaceId: string;
  onCancel: () => void;
  onCreated: () => void;
}

export function OKRForm({ spaceId, onCancel, onCreated }: OKRFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    setError('');

    try {
      const body: Record<string, string> = { title: title.trim() };
      if (description.trim()) body.description = description.trim();
      if (startDate) body.startDate = new Date(startDate).toISOString();
      if (endDate) body.endDate = new Date(endDate).toISOString();

      const res = await fetch(`/api/spaces/${spaceId}/okrs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        throw new Error('OKR 생성에 실패했습니다.');
      }

      onCreated();
    } catch {
      setError('OKR 생성에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900">새 OKR 만들기</h3>

      <div className="mt-4 space-y-4">
        <div>
          <label htmlFor="okr-title" className="mb-1.5 block text-sm font-medium text-gray-700">
            제목 <span className="text-red-500">*</span>
          </label>
          <Input
            id="okr-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="예: 2026 Q1 제품 성장"
            maxLength={100}
          />
        </div>

        <div>
          <label htmlFor="okr-desc" className="mb-1.5 block text-sm font-medium text-gray-700">
            설명
          </label>
          <Input
            id="okr-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="OKR에 대한 간단한 설명"
            maxLength={1000}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="okr-start" className="mb-1.5 block text-sm font-medium text-gray-700">
              시작일
            </label>
            <Input
              id="okr-start"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="okr-end" className="mb-1.5 block text-sm font-medium text-gray-700">
              종료일
            </label>
            <Input
              id="okr-end"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            취소
          </Button>
          <Button type="submit" disabled={isSubmitting || !title.trim()}>
            {isSubmitting ? '생성 중...' : '만들기'}
          </Button>
        </div>
      </div>
    </form>
  );
}
