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

export default function AdminRoundsPage() {
  const [rounds, setRounds] = useState<(OrderRound & { order_count: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [deadline, setDeadline] = useState('');

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
    setTitle('');
    setDeadline('');
    fetchRounds();
  };

  if (loading) return <div className="text-center py-12 text-gray-500">로딩 중...</div>;

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">주문 라운드</h1>

      <div className="bg-white rounded border p-4 mb-6">
        <h2 className="text-sm font-medium mb-3">새 라운드 생성</h2>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="제목 (선택)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border rounded px-3 py-1.5 text-sm flex-1"
          />
          <input
            type="datetime-local"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="border rounded px-3 py-1.5 text-sm"
          />
          <button
            onClick={handleCreate}
            className="bg-black text-white px-4 py-1.5 rounded text-sm hover:bg-gray-800"
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
