'use client';

import { ApartDetailResponse } from '@/app/api/apart/types';

import { useTransactionHistoryChartData } from '../hooks/useTransactionHistoryChartData';
import { useTransactionHistoryChartView } from '../hooks/useTransactionHistoryChartView';

interface Props {
  tradeItems: ApartDetailResponse['tradeItems'];
  allSizes: number[];
}

const HEIGHT = 350;

export function ApartTransactionHistoryChart({ tradeItems, allSizes }: Props) {
  const { chartData, legendData } = useTransactionHistoryChartData({
    tradeItems,
    allSizes,
  });

  const { svgRef, isLoading } = useTransactionHistoryChartView({
    chartData,
    legendData,
    height: HEIGHT,
  });

  return (
    <div className="relative w-full">
      <div
        className="relative"
        style={{ width: '100%', height: `${HEIGHT}px`, touchAction: 'none' }}
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
