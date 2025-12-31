'use client';

import { SearchedApartmentItem } from '@/entities/apart';
import { useMonthlyTransactionsByAparts } from '@/entities/transaction';
import { PageContainer } from '@/shared/ui/PageContainer';

import { useEffect, useState } from 'react';

import { CHART_HEIGHT } from './consts';
import { useCompareChart } from './hooks/useCompareChart';
import { PeriodValue } from './types';
import { CompareChartFilter } from './ui/CompareChartFilter';
import { CompareChartLegend } from './ui/CompareChartLegend';

interface Props {
  selectedApartIds: number[];
  selectedAparts: SearchedApartmentItem[];
  selectedSizesByApart: Map<number, [number, number][]>;
  availableSizesByApart: Map<number, [number, number][]>;
  setAvailableSizesByApart: React.Dispatch<
    React.SetStateAction<Map<number, [number, number][]>>
  >;
  setSelectedSizesByApart: React.Dispatch<
    React.SetStateAction<Map<number, [number, number][]>>
  >;
  onRemoveApartId: (apartId: number) => void;
  onToggleSize: (apartId: number, sizeRange: [number, number]) => void;
}

export function CompareChart({
  selectedApartIds,
  selectedAparts,
  selectedSizesByApart,
  availableSizesByApart,
  setAvailableSizesByApart,
  setSelectedSizesByApart,
  onRemoveApartId,
  onToggleSize,
}: Props) {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodValue>(60);

  const { svgRef, isLoading, legendData } = useCompareChart({
    selectedApartIds,
    selectedPeriod,
    selectedSizesByApart,
  });

  const { data } = useMonthlyTransactionsByAparts({
    apartIds: selectedApartIds,
    period: selectedPeriod || undefined,
  });

  useEffect(() => {
    if (!data) return;

    const newAvailableSizes = new Map<number, [number, number][]>();
    const newSelectedSizes = new Map<number, [number, number][]>();

    data.forEach(apart => {
      if (apart.availableSizes.length > 0) {
        newAvailableSizes.set(apart.apartId, apart.availableSizes);

        if (!selectedSizesByApart.has(apart.apartId)) {
          newSelectedSizes.set(apart.apartId, apart.availableSizes);
        }
      }
    });

    setAvailableSizesByApart(newAvailableSizes);

    setSelectedSizesByApart(prev => {
      const merged = new Map(prev);
      newSelectedSizes.forEach((sizes, apartId) => {
        if (!merged.has(apartId)) {
          merged.set(apartId, sizes);
        }
      });
      return merged;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  if (selectedApartIds.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-y-3">
      <CompareChartLegend
        legendData={legendData}
        selectedAparts={selectedAparts}
        availableSizesByApart={availableSizesByApart}
        selectedSizesByApart={selectedSizesByApart}
        onRemoveApartId={onRemoveApartId}
        onToggleSize={onToggleSize}
      />
      <PageContainer className="flex flex-col gap-y-2">
        <CompareChartFilter
          selectedPeriod={selectedPeriod}
          onChangePeriod={setSelectedPeriod}
        />
        <div className="relative -mx-2 w-full">
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
      </PageContainer>
    </div>
  );
}
