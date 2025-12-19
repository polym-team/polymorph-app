'use client';

import { useState } from 'react';

import { Card } from '@package/ui';

import { CHART_HEIGHT } from './consts';
import { useCompareChart } from './hooks/useCompareChart';
import { PeriodValue } from './types';
import { CompareChartFilter } from './ui/CompareChartFilter';
import { CompareChartLegend } from './ui/CompareChartLegend';

interface Props {
  selectedApartIds: number[];
  onRemoveApartId: (apartId: number) => void;
}

export function CompareChart({ selectedApartIds, onRemoveApartId }: Props) {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodValue>(60);

  const { svgRef, isLoading, legendData } = useCompareChart({
    selectedApartIds,
    selectedPeriod,
  });

  if (selectedApartIds.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-y-5">
      <CompareChartLegend
        legendData={legendData}
        onRemoveApartId={onRemoveApartId}
      />
      <div className="flex flex-col gap-y-2">
        <CompareChartFilter
          selectedPeriod={selectedPeriod}
          onChangePeriod={setSelectedPeriod}
        />
        <Card className="flex flex-col pl-0 pr-2">
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
        </Card>
      </div>
    </div>
  );
}
