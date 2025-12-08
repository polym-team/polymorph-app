'use client';

import { ApartTransactionItem } from '@/entities/apart-transaction';

import { useTransactionChart } from './ hooks/useTransactionChart';

interface Props {
  allSizes: number[];
  transactionItems: ApartTransactionItem[];
}

const CHART_HEIGHT = 300;

export function TransactionChart({ transactionItems, allSizes }: Props) {
  const { svgRef, isLoading } = useTransactionChart({
    transactionItems,
    allSizes,
  });

  if (!isLoading && transactionItems.length === 0) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-500">
        표시할 데이터가 없어요
      </div>
    );
  }

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
