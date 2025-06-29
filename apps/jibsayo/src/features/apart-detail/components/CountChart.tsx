'use client';

import { ApartDetailResponse } from '@/app/api/apart/types';

import { useEffect, useRef, useState } from 'react';

import { Card, Typography } from '@package/ui';

import { useCountChart } from '../hooks/useCountChart';

interface Props {
  items: ApartDetailResponse['tradeItems'];
}

export function CountChart({ items }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
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

  const margin = { top: 20, right: 0, bottom: 30, left: 35 };
  const height = 200;

  const {
    isLoading,
    legendData,
    selectedPyeongs,
    togglePyeong,
    toggleAllPyeongs,
  } = useCountChart({
    items,
    svgRef,
    tooltipRef,
    height,
    margin,
    period: 120, // 최근 10년
  });

  return (
    <Card className="p-3 md:p-5">
      <div className="mb-5">
        <Typography variant="large" className="font-semibold">
          거래건수 차트
        </Typography>
      </div>
      <div className="relative w-full">
        <div
          className="relative h-[200px]"
          style={{
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
              {legendData.map(item => {
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
