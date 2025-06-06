'use client';

import { ApartDetailResponse } from '@/app/api/apart/types';

import { useRef } from 'react';

import { Card, Typography } from '@package/ui';

import { useTransactionChart } from '../hooks/useTransactionChart';
import { ChartSkeleton } from '../ui/ChartSkeleton';

interface Props {
  items: ApartDetailResponse['tradeItems'];
}

export function TransactionChart({ items }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  const margin = { top: 20, right: 20, bottom: 30, left: 60 };
  const height = 400;

  const { isLoading } = useTransactionChart({
    items,
    svgRef,
    tooltipRef,
    height,
    margin,
  });

  return (
    <Card className="p-5">
      <Typography variant="large" className="mb-5 font-semibold">
        실거래가 차트
      </Typography>
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
          <svg
            ref={svgRef}
            style={{
              width: '100%',
              height: '100%',
            }}
          >
            {isLoading ? <ChartSkeleton /> : null}
          </svg>
        </div>
      </div>
    </Card>
  );
}
