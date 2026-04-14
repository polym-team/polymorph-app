'use client';

import { useState } from 'react';

interface Props {
  onClose: () => void;
  onAdded: () => void;
}

export function AddAccountForm({ onClose, onAdded }: Props) {
  const [dhlotteryId, setDhlotteryId] = useState('');
  const [dhlotteryPw, setDhlotteryPw] = useState('');
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dhlotteryId, dhlotteryPw, nickname: nickname || undefined }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || '계정 추가에 실패했습니다.');
        return;
      }

      onAdded();
    } catch {
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border bg-white p-4 shadow-sm">
      <h3 className="mb-4 font-medium">동행복권 계정 추가</h3>

      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-xs text-gray-500">별명 (선택)</label>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="예: 내 계정"
            className="w-full rounded border px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-gray-500">동행복권 아이디</label>
          <input
            type="text"
            value={dhlotteryId}
            onChange={(e) => setDhlotteryId(e.target.value)}
            required
            className="w-full rounded border px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-gray-500">동행복권 비밀번호</label>
          <input
            type="password"
            value={dhlotteryPw}
            onChange={(e) => setDhlotteryPw(e.target.value)}
            required
            className="w-full rounded border px-3 py-2 text-sm"
          />
        </div>
      </div>

      {error && (
        <div className="mt-3 rounded bg-red-50 p-2 text-sm text-red-600">{error}</div>
      )}

      <div className="mt-4 flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg px-4 py-2 text-sm text-gray-500 hover:bg-gray-100"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-lotto-500 px-4 py-2 text-sm font-medium text-white hover:bg-lotto-600 disabled:opacity-50"
        >
          {loading ? '추가 중...' : '추가'}
        </button>
      </div>
    </form>
  );
}
