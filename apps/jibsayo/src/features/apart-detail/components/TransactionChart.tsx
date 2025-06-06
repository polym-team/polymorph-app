'use client';

import { ApartDetailResponse } from '@/app/api/apart/types';

import { useRef } from 'react';

import { Card, Typography } from '@package/ui';

import { useTransactionChart } from '../hooks/useTransactionChart';

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
