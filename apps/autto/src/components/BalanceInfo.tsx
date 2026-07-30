'use client';

import { useState, useEffect } from 'react';
import { Button } from '@package/ui';
import type { BalanceInfo as BalanceInfoType } from '@/lib/dhlottery';

interface Props {
  accountId: number;
}

function formatMoney(n: number): string {
  return n.toLocaleString() + '원';
}

export function BalanceInfo({ accountId }: Props) {
  const [balance, setBalance] = useState<BalanceInfoType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setBalance(null);
    setError(null);
  }, [accountId]);

  async function fetchBalance() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/lotto/balance?accountId=${accountId}`);
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || '조회 실패');
        return;
      }
      setBalance(await res.json());
    } catch {
      setError('네트워크 오류');
    } finally {
      setLoading(false);
    }
  }

  if (!balance && !loading && !error) {
    return (
      <Button variant="outline" size="sm" onClick={fetchBalance} className="w-full">
        예치금 조회
      </Button>
    );
  }

  if (loading) {
    return (
      <div className="rounded-lg bg-muted/40 p-4 text-center text-sm text-muted-foreground">
        예치금 조회 중...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-danger/10 p-3 text-sm text-danger">
        {error}
        <button onClick={fetchBalance} className="ml-2 underline">
          재시도
        </button>
      </div>
    );
  }

  if (!balance) return null;

  return (
    <div className="rounded-lg bg-muted/40 p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">예치금 현황</h3>
        <button onClick={fetchBalance} className="text-xs text-muted-foreground transition hover:text-foreground">
          새로고침
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="text-xs text-muted-foreground">총 예치금</div>
          <div className="text-lg font-bold text-foreground tabular-nums">{formatMoney(balance.totalDeposit)}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">구매 가능</div>
          <div className="text-lg font-bold text-primary tabular-nums">{formatMoney(balance.purchasableAmount)}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">이번달 구매</div>
          <div className="text-sm text-foreground tabular-nums">{formatMoney(balance.monthlyPurchaseTotal)}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">예약/출금중</div>
          <div className="text-sm text-foreground tabular-nums">{formatMoney(balance.reservedAmount + balance.withdrawalPending)}</div>
        </div>
      </div>
    </div>
  );
}
