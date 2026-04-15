'use client';

import { ROUTE_PATH } from '@/shared/consts/route';

import { useRouter } from 'next/navigation';

import type { RecentTransaction } from '../../types';

interface Props {
  transactions: RecentTransaction[];
}

function formatPrice(amount: number): string {
  const eok = Math.floor(amount / 100000000);
  const man = Math.round((amount % 100000000) / 10000);

  if (eok > 0 && man > 0) return `${eok}억 ${man.toLocaleString()}만`;
  if (eok > 0) return `${eok}억`;
  return `${man.toLocaleString()}만`;
}

function formatArea(area: number): string {
  const pyeong = Math.round(area * 0.3025);
  return `${pyeong}평`;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

export function RecentTransactions({ transactions }: Props) {
  const router = useRouter();

  if (transactions.length === 0) return null;

  return (
    <div>
      <h2 className="mb-3 text-base font-bold">최근 실거래</h2>
      <div className="space-y-2">
        {transactions.map(t => (
          <button
            key={t.id}
            className="flex w-full items-center justify-between rounded-lg border bg-white p-3 text-left transition hover:border-blue-200"
            onClick={() => {
              if (t.apartId) router.push(`${ROUTE_PATH.APART}/${t.apartId}`);
            }}
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="truncate text-sm font-medium">{t.apartName}</span>
                <span className="flex-shrink-0 rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500">
                  {t.regionName}
                </span>
              </div>
              <div className="mt-0.5 text-xs text-gray-400">
                {formatArea(t.exclusiveArea)} · {t.floor}층 · {formatDate(t.dealDate)}
              </div>
            </div>
            <div className="flex-shrink-0 text-right">
              <div className="text-sm font-bold">{formatPrice(t.dealAmount)}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
