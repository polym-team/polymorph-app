'use client';

import { useState } from 'react';
import { Button, Input } from '@package/ui';

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
    <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <h3 className="mb-4 font-medium text-foreground">동행복권 계정 추가</h3>

      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">별명 (선택)</label>
          <Input
            type="text"
            size="sm"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="예: 내 계정"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">동행복권 아이디</label>
          <Input
            type="text"
            size="sm"
            value={dhlotteryId}
            onChange={(e) => setDhlotteryId(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">동행복권 비밀번호</label>
          <Input
            type="password"
            size="sm"
            value={dhlotteryPw}
            onChange={(e) => setDhlotteryPw(e.target.value)}
            required
          />
        </div>
      </div>

      {error && (
        <div className="mt-3 rounded bg-danger/10 p-2 text-sm text-danger">{error}</div>
      )}

      <div className="mt-4 flex justify-end gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onClose}>
          취소
        </Button>
        <Button type="submit" variant="primary" size="sm" disabled={loading}>
          {loading ? '추가 중...' : '추가'}
        </Button>
      </div>
    </form>
  );
}
