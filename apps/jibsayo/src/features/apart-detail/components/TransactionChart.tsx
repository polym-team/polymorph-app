'use client';

import { ApartDetailResponse } from '@/app/api/apart/types';

import { useRef, useState } from 'react';

import { Button, Card, Typography } from '@package/ui';

import { useTransactionChart } from '../hooks/useTransactionChart';

interface Props {
  items: ApartDetailResponse['tradeItems'];
}

const PERIODS = [
  { value: '0', label: '전체' },
  { value: '6', label: '최근 6개월' },
  { value: '12', label: '최근 1년' },
  { value: '24', label: '최근 2년' },
  { value: '60', label: '최근 5년' },
  { value: '120', label: '최근 10년' },
] as const;

type PeriodValue = (typeof PERIODS)[number]['value'];

export function TransactionChart({ items }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const [period, setPeriod] = useState<PeriodValue>('60');

  const margin = { top: 20, right: 20, bottom: 30, left: 60 };
  const height = 400;

  const { isLoading } = useTransactionChart({
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
    <Card className="p-5">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Typography variant="large" className="font-semibold">
          실거래가 차트
        </Typography>
        <div className="flex flex-wrap gap-2">
          {PERIODS.map(p => (
            <Button
              key={p.value}
              variant={p.value === period ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => handlePeriodChange(p.value)}
            >
              {p.label}
            </Button>
          ))}
        </div>
      </div>
      <div className="relative w-full overflow-x-auto">
        <div
          className="relative mx-auto"
          style={{
            height: '400px',
            minWidth: '1024px',
            maxWidth: '100%',
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
              position: 'absolute',
              left: 0,
              top: 0,
            }}
          />
        </div>
      </div>
    </Card>
  );
}
