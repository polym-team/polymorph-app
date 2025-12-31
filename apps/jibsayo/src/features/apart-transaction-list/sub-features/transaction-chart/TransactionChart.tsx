'use client';

import { PeriodValue, SizesValue } from '../../types';
import { useTransactionChart } from './ hooks/useTransactionChart';
import { CHART_HEIGHT } from './consts';

interface Props {
  apartId: number;
  allSizes: SizesValue;
  selectedSizes: SizesValue;
  selectedPeriod: PeriodValue;
}

export function TransactionChart({
  apartId,
  allSizes,
  selectedSizes,
  selectedPeriod,
}: Props) {
  const { svgRef, isLoading, isEmpty } = useTransactionChart({
    apartId,
    allSizes,
    selectedSizes,
    selectedPeriod,
  });

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
        {isEmpty && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-gray-500">표시할 데이터가 없어요</p>
          </div>
        )}
        {!isEmpty && (
          <svg
            ref={svgRef}
            style={{
              width: '100%',
              height: '100%',
              touchAction: 'none',
            }}
          />
        )}
      </div>
    </div>
  );
}
