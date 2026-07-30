'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@package/ui';
import { LottoBalls } from '@/components/LottoBalls';
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
        <h2 className="text-lg font-bold text-foreground">
          구매내역
          <span className="ml-2 text-sm font-normal text-muted-foreground">{accountName}</span>
        </h2>
        <button
          onClick={fetchHistory}
          disabled={loading}
          className="text-sm text-primary hover:underline disabled:opacity-50"
        >
          {loading ? '조회 중...' : loaded ? '새로고침' : '조회하기'}
        </button>
      </div>

      {error && (
        <div className="rounded-lg bg-danger/10 p-3 text-sm text-danger">{error}</div>
      )}

      {loaded && history.length === 0 && (
        <div className="rounded-xl border border-border bg-card p-6 text-center text-sm text-muted-foreground shadow-sm">
          최근 14일간 구매내역이 없습니다.
        </div>
      )}

      {history.length > 0 && (
        <div className="space-y-2">
          {history.map((item, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-3 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">{item.lotteryName}</span>
                  <Badge variant="secondary">{item.roundNo}</Badge>
                </div>
                <span className="text-xs text-muted-foreground">{item.purchaseDate}</span>
              </div>
              <div className="mt-2 space-y-1.5">
                {item.numbers.split('\n').map((line, li) => {
                  const colon = line.indexOf(':');
                  const label = colon >= 0 ? line.slice(0, colon).trim() : '';
                  const rest = colon >= 0 ? line.slice(colon + 1) : line;
                  const nums = (rest.match(/\d+/g) ?? []).map((n) => parseInt(n, 10));
                  if (nums.length === 0) {
                    return (
                      <div key={li} className="text-xs text-muted-foreground">{line}</div>
                    );
                  }
                  return (
                    <div key={li} className="flex items-center gap-2">
                      {label && (
                        <span className="w-16 shrink-0 text-xs text-muted-foreground">{label}</span>
                      )}
                      <LottoBalls numbers={nums} size="sm" />
                    </div>
                  );
                })}
              </div>
              <div className="mt-2 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{item.quantity}매 · 추첨 {item.drawDate}</span>
                <span
                  className={`font-medium ${
                    item.winResult && item.winResult !== '미추첨' && item.winResult !== '낙첨'
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-muted-foreground'
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
