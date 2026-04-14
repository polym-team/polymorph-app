'use client';

import { useState, useEffect } from 'react';
import type { PurchaseHistoryItem } from '@/lib/dhlottery';

interface Props {
  accountId: number;
  accountName: string;
}

export function PurchaseHistory({ accountId, accountName }: Props) {
  const [history, setHistory] = useState<PurchaseHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setHistory([]);
    setLoaded(false);
    setError(null);
  }, [accountId]);

  async function fetchHistory() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/lotto/history?accountId=${accountId}`);
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || '조회 실패');
        return;
      }
      setHistory(await res.json());
      setLoaded(true);
    } catch {
      setError('네트워크 오류');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-bold">
          구매내역
          <span className="ml-2 text-sm font-normal text-gray-400">{accountName}</span>
        </h2>
        <button
          onClick={fetchHistory}
          disabled={loading}
          className="text-sm text-lotto-600 hover:underline disabled:opacity-50"
        >
          {loading ? '조회 중...' : loaded ? '새로고침' : '조회하기'}
        </button>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>
      )}

      {loaded && history.length === 0 && (
        <div className="rounded-lg border bg-white p-6 text-center text-sm text-gray-400">
          최근 14일간 구매내역이 없습니다.
        </div>
      )}

      {history.length > 0 && (
        <div className="space-y-2">
          {history.map((item, i) => (
            <div key={i} className="rounded-lg border bg-white p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{item.lotteryName}</span>
                  <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500">
                    {item.roundNo}
                  </span>
                </div>
                <span className="text-xs text-gray-400">{item.purchaseDate}</span>
              </div>
              <div className="mt-2 whitespace-pre-wrap text-xs text-gray-600">
                {item.numbers}
              </div>
              <div className="mt-2 flex items-center justify-between text-xs">
                <span className="text-gray-400">{item.quantity}매 · 추첨 {item.drawDate}</span>
                <span
                  className={`font-medium ${
                    item.winResult && item.winResult !== '미추첨' && item.winResult !== '낙첨'
                      ? 'text-red-500'
                      : 'text-gray-400'
                  }`}
                >
                  {item.winResult || '미추첨'} {item.winAmount !== '-' ? item.winAmount : ''}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
