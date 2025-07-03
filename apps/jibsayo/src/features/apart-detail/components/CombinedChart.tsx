'use client';

import { ApartDetailResponse } from '@/app/api/apart/types';

import { useEffect, useRef, useState } from 'react';

import { Button, Card, Typography } from '@package/ui';

import { LegendItem, useCombinedChart } from '../hooks/useCombinedChart';

interface Props {
  items: ApartDetailResponse['tradeItems'];
}

const PERIODS = [
  { value: '0', label: '전체' },
  { value: '12', label: '최근 1년' },
  { value: '24', label: '최근 2년' },
  { value: '36', label: '최근 3년' },
  { value: '60', label: '최근 5년' },
] as const;

type PeriodValue = (typeof PERIODS)[number]['value'];

export function CombinedChart({ items }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const [period, setPeriod] = useState<PeriodValue>('60');
  const [windowWidth, setWindowWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const margin = { top: 20, right: 35, bottom: 30, left: 30 };
  const height = windowWidth <= 640 ? 250 : 350;

  const {
    isLoading,
    legendData,
    selectedPyeongs,
    togglePyeong,
    toggleAllPyeongs,
  } = useCombinedChart({
    items,
    svgRef,
    tooltipRef,
    height,
    margin,
    period: Number(period),
  });

  const handlePeriodChange = (value: PeriodValue) => {
    setPeriod(value);
  };

  return (
    <Card className="p-3 md:p-5">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Typography variant="large" className="font-semibold">
          실거래가 & 거래건수 차트
        </Typography>
        <div className="flex flex-wrap gap-1 sm:gap-2">
          {PERIODS.map(p => (
            <Button
              key={p.value}
              variant={p.value === period ? 'primary' : 'secondary'}
              size="sm"
              className="min-w-0 flex-1 sm:flex-none"
              onClick={() => handlePeriodChange(p.value)}
            >
              {p.label}
            </Button>
          ))}
        </div>
      </div>

      {/* 차트 범례 */}
      <div className="mb-4 flex items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="h-3 w-8 bg-blue-500"></div>
          <span>실거래가 (만원)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-8 bg-gray-400"></div>
          <span>거래건수 (건)</span>
        </div>
      </div>

      <div className="relative w-full">
        <div
          className="relative"
          style={{
            width: '100%',
            height: `${height}px`,
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
            }}
          />
        </div>

        <div className="mt-4 flex min-h-[60px] flex-wrap items-center justify-center gap-2">
          {!isLoading && legendData.length > 0 && (
            <>
              {legendData.map((item: LegendItem) => {
                const isSelected = selectedPyeongs.has(item.pyeong);
                return (
                  <button
                    key={item.pyeong}
                    onClick={() => togglePyeong(item.pyeong)}
                    className={`flex items-center gap-2 rounded-md border px-2 py-1 transition-all ${
                      isSelected
                        ? 'border-gray-300 bg-gray-100 shadow-sm'
                        : 'border-gray-200 bg-gray-50 opacity-50 hover:opacity-75'
                    }`}
                  >
                    <div
                      className="h-3 w-3 rounded-sm"
                      style={{ backgroundColor: item.color }}
                    />
                    <span
                      className={`text-sm font-medium ${
                        isSelected ? 'text-gray-800' : 'text-gray-600'
                      }`}
                    >
                      {item.pyeong}평
                    </span>
                  </button>
                );
              })}
            </>
          )}
        </div>
      </div>
    </Card>
  );
}
