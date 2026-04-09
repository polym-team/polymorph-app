'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { OrderRound } from '@/types';

const STATUS_LABELS: Record<string, { text: string; color: string }> = {
  open: { text: '접수중', color: 'bg-green-100 text-green-800' },
  closed: { text: '마감', color: 'bg-yellow-100 text-yellow-800' },
  ordered: { text: '주문완료', color: 'bg-blue-100 text-blue-800' },
  settled: { text: '정산완료', color: 'bg-gray-100 text-gray-800' },
};

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

  if (loading) return <div className="text-center py-12 text-gray-500">로딩 중...</div>;

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">주문 라운드</h1>

      <div className="bg-white rounded border p-4 mb-6">
        <h2 className="text-sm font-medium mb-3">새 라운드 생성</h2>
        <div className="flex flex-wrap gap-2">
          <input
            type="text"
            placeholder="제목 (선택)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border rounded px-3 py-1.5 text-sm flex-1 min-w-[120px]"
          />
          <input
            type="datetime-local"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="border rounded px-3 py-1.5 text-sm min-w-0"
          />
          <button
            onClick={handleCreate}
            className="bg-accent-500 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-accent-600 font-medium"
          >
            생성
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {rounds.map((round) => {
          const statusInfo = STATUS_LABELS[round.status];
          return (
            <Link
              key={round.id}
              href={`/admin/rounds/${round.id}`}
              className="bg-white rounded border p-4 flex items-center justify-between hover:bg-gray-50 block"
            >
              <div>
                <span className="font-medium text-sm">
                  {round.title || `라운드 #${round.id}`}
                </span>
                <span className="text-xs text-gray-400 ml-2">
                  {new Date(round.createdAt).toLocaleDateString('ko-KR')}
                </span>
                {round.deadline && (
                  <span className="text-xs text-gray-400 ml-2">
                    마감: {new Date(round.deadline).toLocaleString('ko-KR')}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500">{round.order_count}건</span>
                <span className={`text-xs px-2 py-0.5 rounded ${statusInfo.color}`}>
                  {statusInfo.text}
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {rounds.length === 0 && (
        <div className="text-center py-12 text-gray-400">라운드가 없습니다.</div>
      )}
    </div>
  );
}
