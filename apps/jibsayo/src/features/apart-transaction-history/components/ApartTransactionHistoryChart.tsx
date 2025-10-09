'use client';

import { ApartDetailResponse } from '@/app/api/apart/types';

import { useEffect, useMemo, useState } from 'react';

import { useTransactionHistoryChartData } from '../hooks/useTransactionHistoryChartData';
import { useTransactionHistoryChartView } from '../hooks/useTransactionHistoryChartView';

interface Props {
  tradeItems: ApartDetailResponse['tradeItems'];
  allSizes: number[];
}

export function ApartTransactionHistoryChart({ tradeItems, allSizes }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const margin = { top: 20, right: 35, bottom: 30, left: 30 };
  const height = useMemo(() => {
    return 250;
  }, [mounted]);

  const chartContainerStyle = useMemo(
    () => ({
      width: '100%',
      height: `${height}px`,
      touchAction: 'none',
    }),
    [height]
  );

  const { chartData, legendData } = useTransactionHistoryChartData({
    tradeItems,
    allSizes,
  });

  const { svgRef, isLoading } = useTransactionHistoryChartView({
    chartData,
    legendData,
    height,
    margin,
  });

  return (
    <div className="relative w-full">
      <div className="relative" style={chartContainerStyle}>
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
