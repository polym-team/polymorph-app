'use client';

import { useState, useEffect } from 'react';
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
      <button
        onClick={fetchBalance}
        className="w-full rounded-lg border border-gray-200 py-2 text-sm text-gray-500 hover:bg-gray-50"
      >
        예치금 조회
      </button>
    );
  }

  if (loading) {
    return (
      <div className="rounded-lg bg-gray-50 p-4 text-center text-sm text-gray-400">
        예치금 조회 중...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
        {error}
        <button onClick={fetchBalance} className="ml-2 underline">
          재시도
        </button>
      </div>
    );
  }

  if (!balance) return null;

  return (
    <div className="rounded-lg bg-gray-50 p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-600">예치금 현황</h3>
        <button onClick={fetchBalance} className="text-xs text-gray-400 hover:text-gray-600">
          새로고침
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="text-xs text-gray-400">총 예치금</div>
          <div className="text-lg font-bold text-gray-800">{formatMoney(balance.totalDeposit)}</div>
        </div>
        <div>
          <div className="text-xs text-gray-400">구매 가능</div>
          <div className="text-lg font-bold text-lotto-600">{formatMoney(balance.purchasableAmount)}</div>
        </div>
        <div>
          <div className="text-xs text-gray-400">이번달 구매</div>
          <div className="text-sm text-gray-600">{formatMoney(balance.monthlyPurchaseTotal)}</div>
        </div>
        <div>
          <div className="text-xs text-gray-400">예약/출금중</div>
          <div className="text-sm text-gray-600">{formatMoney(balance.reservedAmount + balance.withdrawalPending)}</div>
        </div>
      </div>
    </div>
  );
}
