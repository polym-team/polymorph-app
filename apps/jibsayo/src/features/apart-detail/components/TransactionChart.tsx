'use client';

import { ApartDetailResponse } from '@/app/api/apart/types';

import { useEffect, useRef, useState } from 'react';

import { Button, Card, Typography } from '@package/ui';

import { LegendItem, useTransactionChart } from '../hooks/useTransactionChart';

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

export function TransactionChart({ items }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const [period, setPeriod] = useState<PeriodValue>('60');
  const [windowWidth, setWindowWidth] = useState<number>(0);

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

  const { isLoading, legendData } = useTransactionChart({
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

        {/* HTML 범례 */}
        {legendData.length > 0 && (
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {legendData.map((item: LegendItem) => (
              <div
                key={item.pyeong}
                className="flex items-center gap-2 rounded-md bg-gray-50 px-2 py-1"
              >
                <div
                  className="h-3 w-3 rounded-sm"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-gray-700">
                  {windowWidth <= 640
                    ? `${item.pyeong}평`
                    : `${item.pyeong}평 (${item.sizes.map(s => `${s}㎡`).join(', ')})`}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
