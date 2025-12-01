'use client';

import { ApartTransactionItem } from '@/entities/apart-transaction';

import { useTransactionChart } from './ hooks/useTransactionChart';

interface Props {
  allSizes: number[];
  tradeItems: ApartTransactionItem[];
}

const CHART_HEIGHT = 300;

export function TransactionChart({ tradeItems, allSizes }: Props) {
  const { svgRef, isLoading } = useTransactionChart({
    tradeItems,
    allSizes,
  });

  return (
    <div className="relative w-full">
      <div
        className="relative"
        style={{
          width: '100%',
          height: `${CHART_HEIGHT}px`,
          touchAction: 'none',
        }}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80">
            <div className="border-primary h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" />
          </div>
        )}
        <svg
          ref={svgRef}
          style={{
            width: '100%',
            height: '100%',
            touchAction: 'none',
          }}
        />
      </div>
    </div>
  );
}
