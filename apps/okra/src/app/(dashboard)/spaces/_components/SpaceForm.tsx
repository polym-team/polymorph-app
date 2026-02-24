'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input } from '@package/ui';

const EMOJI_OPTIONS = ['🎯', '🚀', '💡', '⭐', '🔥', '💪', '🌱', '📊', '🏆', '💼'];

export function SpaceForm({ onCancel }: { onCancel: () => void }) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [iconEmoji, setIconEmoji] = useState('🎯');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/spaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), description: description.trim() || undefined, iconEmoji }),
      });

      if (!res.ok) {
        throw new Error('Space 생성에 실패했습니다.');
      }

      const space = await res.json();
      router.push(`/spaces/${space.id}`);
    } catch {
      setError('Space 생성에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900">새 Space 만들기</h3>

      <div className="mt-4 space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">아이콘</label>
          <div className="flex gap-2">
            {EMOJI_OPTIONS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => setIconEmoji(emoji)}
                className={`flex h-10 w-10 items-center justify-center rounded-lg border text-xl transition-colors ${
                  iconEmoji === emoji ? 'border-gray-900 bg-gray-100' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="space-name" className="mb-1.5 block text-sm font-medium text-gray-700">
            이름 <span className="text-red-500">*</span>
          </label>
          <Input
            id="space-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="예: 프로덕트팀 OKR"
            maxLength={50}
          />
        </div>

        <div>
          <label htmlFor="space-desc" className="mb-1.5 block text-sm font-medium text-gray-700">
            설명
          </label>
          <Input
            id="space-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Space에 대한 간단한 설명"
            maxLength={200}
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            취소
          </Button>
          <Button type="submit" disabled={isSubmitting || !name.trim()}>
            {isSubmitting ? '생성 중...' : '만들기'}
          </Button>
        </div>
      </div>
    </form>
  );
}
