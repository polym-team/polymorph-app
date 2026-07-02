'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { OrderRound } from '@/types';
import { PageHeader, SectionCard, Button, StatusBadge, EmptyState, fieldClass } from '@/components/ui';
import { ROUND_STATUS } from '@/lib/status';
import { formatDate, formatDateTime } from '@/lib/format';

const ROUND_NAMES = [
  '봄맞이 공구', '여름 준비 공구', '가을 공구', '겨울 준비 공구',
  '이번 주 공구', '월간 공구', '깜짝 공구', '정기 공구',
  '뷰티 공구', '스킨케어 공구', '바디케어 공구', '선케어 공구',
];

function generateDefaults() {
  const now = new Date();
  const name = ROUND_NAMES[now.getMonth() % ROUND_NAMES.length];

  // 일주일 뒤 오후 4시
  const dl = new Date(now);
  dl.setDate(dl.getDate() + 7);
  dl.setHours(16, 0, 0, 0);
  // datetime-local 형식: YYYY-MM-DDTHH:mm
  const pad = (n: number) => String(n).padStart(2, '0');
  const deadlineStr = `${dl.getFullYear()}-${pad(dl.getMonth() + 1)}-${pad(dl.getDate())}T${pad(dl.getHours())}:${pad(dl.getMinutes())}`;

  return { title: name, deadline: deadlineStr };
}

export default function AdminRoundsPage() {
  const [rounds, setRounds] = useState<(OrderRound & { order_count: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const defaults = generateDefaults();
  const [title, setTitle] = useState(defaults.title);
  const [deadline, setDeadline] = useState(defaults.deadline);

  const fetchRounds = () => {
    fetch('/api/rounds')
      .then((r) => r.json())
      .then((data) => {
        setRounds(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchRounds();
  }, []);

  const handleCreate = async () => {
    await fetch('/api/rounds', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: title || undefined, deadline: deadline || undefined }),
    });
    const next = generateDefaults();
    setTitle(next.title);
    setDeadline(next.deadline);
    fetchRounds();
  };

  const handleDelete = async (round: OrderRound & { order_count: number }) => {
    const label = round.title || `라운드 #${round.id}`;
    if (!confirm(`'${label}' 라운드를 삭제하시겠습니까?`)) return;

    const res = await fetch(`/api/rounds/${round.id}`, { method: 'DELETE' });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.error || '삭제에 실패했습니다');
      return;
    }
    fetchRounds();
  };

  if (loading) return <div className="text-center py-12 text-ink-600">로딩 중...</div>;

  return (
    <div>
      <PageHeader title="주문 라운드" />

      <SectionCard className="p-4 mb-6">
        <h2 className="text-sm font-medium text-ink-900 mb-3">새 라운드 생성</h2>
        <div className="flex flex-wrap gap-2">
          <input
            type="text"
            placeholder="제목 (선택)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={`${fieldClass} flex-1 min-w-[120px]`}
          />
          <input
            type="datetime-local"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className={`${fieldClass} w-auto min-w-0`}
          />
          <Button variant="accent" size="sm" onClick={handleCreate}>
            생성
          </Button>
        </div>
      </SectionCard>

      <div className="space-y-2">
        {rounds.map((round) => {
          const canDelete = round.order_count === 0;
          return (
            <SectionCard
              key={round.id}
              className="flex items-center justify-between hover:border-clay-500/40 transition-colors"
            >
              <Link href={`/admin/rounds/${round.id}`} className="flex-1 p-4">
                <span className="font-medium text-sm text-ink-900">
                  {round.title || `라운드 #${round.id}`}
                </span>
                <span className="text-xs text-ink-400 ml-2">{formatDate(round.createdAt)}</span>
                {round.deadline && (
                  <span className="text-xs text-ink-400 ml-2">마감: {formatDateTime(round.deadline)}</span>
                )}
              </Link>
              <div className="flex items-center gap-3 pr-4">
                <span className="text-sm text-ink-600 tnum">{round.order_count}건</span>
                <StatusBadge status={ROUND_STATUS[round.status]} />
                {canDelete && (
                  <button
                    onClick={() => handleDelete(round)}
                    className="text-xs text-ink-400 hover:text-terra-600 px-2 py-1 rounded hover:bg-terra-50 transition-colors"
                  >
                    삭제
                  </button>
                )}
              </div>
            </SectionCard>
          );
        })}
      </div>

      {rounds.length === 0 && <EmptyState title="라운드가 없습니다" />}
    </div>
  );
}
