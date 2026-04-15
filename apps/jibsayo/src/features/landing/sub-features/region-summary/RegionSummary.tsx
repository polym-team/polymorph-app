'use client';

import { ROUTE_PATH } from '@/shared/consts/route';

import { useRouter } from 'next/navigation';

import type { RegionPriceSummary } from '../../types';

interface Props {
  summaries: RegionPriceSummary[];
}

function formatPrice(amount: number): string {
  const eok = Math.floor(amount / 100000000);
  const man = Math.round((amount % 100000000) / 10000);

  if (eok > 0 && man > 0) return `${eok}억 ${man.toLocaleString()}만`;
  if (eok > 0) return `${eok}억`;
  return `${man.toLocaleString()}만`;
}

function getChangeRate(current: number, prev: number | null): { text: string; color: string } {
  if (!prev) return { text: '-', color: 'text-gray-400' };
  const rate = ((current - prev) / prev) * 100;
  if (rate > 0) return { text: `+${rate.toFixed(1)}%`, color: 'text-red-500' };
  if (rate < 0) return { text: `${rate.toFixed(1)}%`, color: 'text-blue-500' };
  return { text: '0%', color: 'text-gray-400' };
}

export function RegionSummary({ summaries }: Props) {
  const router = useRouter();

  if (summaries.length === 0) return null;

  function handleClick(regionCode: string) {
    const now = new Date();
    const tradeDate = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
    router.push(`${ROUTE_PATH.TRANSACTIONS}?regionCode=${regionCode}&tradeDate=${tradeDate}`);
  }

  return (
    <div>
      <h2 className="mb-3 text-base font-bold">서울 주요 지역 시세</h2>
      <div className="grid grid-cols-2 gap-2">
        {summaries.map(s => {
          const change = getChangeRate(s.avgPrice, s.prevAvgPrice);
          return (
            <button
              key={s.regionCode}
              className="rounded-lg border bg-white p-3 text-left transition hover:border-blue-200 hover:bg-blue-50"
              onClick={() => handleClick(s.regionCode)}
            >
              <div className="mb-1 flex items-center justify-between">
                <span className="text-sm font-medium">{s.regionName}</span>
                <span className={`text-xs font-medium ${change.color}`}>
                  {change.text}
                </span>
              </div>
              <div className="text-base font-bold">
                {formatPrice(s.avgPrice)}
              </div>
              <div className="mt-0.5 text-xs text-gray-400">
                {s.transactionCount}건 거래
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
