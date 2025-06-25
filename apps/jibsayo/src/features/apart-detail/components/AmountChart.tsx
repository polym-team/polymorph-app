'use client';

import { ApartDetailResponse } from '@/app/api/apart/types';

import { useEffect, useRef, useState } from 'react';

import { Button, Card, Typography } from '@package/ui';

import { LegendItem, useAmountChart } from '../hooks/useAmountChart';

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

export function AmountChart({ items }: Props) {
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

  const margin = { top: 20, right: 20, bottom: 30, left: 60 };
  const height = windowWidth <= 640 ? 250 : 400;

  const {
    isLoading,
    legendData,
    selectedPyeongs,
    togglePyeong,
    toggleAllPyeongs,
  } = useAmountChart({
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
          실거래가 차트
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
      <div className="relative w-full">
        <div
          className="relative"
          style={{
            height: windowWidth <= 640 ? '250px' : '400px',
            width: '100%',
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
                      {windowWidth <= 640
                        ? `${item.pyeong}평`
                        : `${item.pyeong}평 (${item.sizes.map(s => s.toFixed(2)).join('㎡, ')}㎡)`}
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
