import { SearchedApartmentItem } from '@/entities/apart';
import { calculateAreaPyeong } from '@/entities/transaction';
import { PageContainer } from '@/shared/ui/PageContainer';
import { formatPyeongText } from '@/shared/utils/formatter';

import { X } from 'lucide-react';
import { useMemo } from 'react';

import { Button } from '@package/ui';

import { CHART_COLORS } from '../consts';
import { ChartLegendItem } from '../types';

interface CompareChartLegendProps {
  legendData: ChartLegendItem[];
  selectedAparts: SearchedApartmentItem[];
  availableSizesByApart: Map<number, [number, number][]>;
  selectedSizesByApart: Map<number, [number, number][]>;
  isLoadingSizes: boolean;
  onRemoveApartId: (apartId: number) => void;
  onToggleSize: (apartId: number, sizeRange: [number, number]) => void;
}

export function CompareChartLegend({
  legendData,
  selectedAparts,
  availableSizesByApart,
  selectedSizesByApart,
  isLoadingSizes,
  onRemoveApartId,
  onToggleSize,
}: CompareChartLegendProps) {
  const displayItems = useMemo(() => {
    return selectedAparts.map((apart, index) => {
      const legendItem = legendData.find(item => item.apartId === apart.id);
      return {
        apartId: apart.id,
        apartName: apart.apartName,
        color: legendItem?.color || CHART_COLORS[index % CHART_COLORS.length],
      };
    });
  }, [selectedAparts, legendData]);

  if (displayItems.length === 0) return null;

  return (
    <PageContainer className="flex flex-col gap-y-3">
      <span className="text-sm text-gray-500">비교중 아파트</span>
      <div className="flex flex-col flex-wrap gap-2">
        {displayItems.map(item => {
          const availableSizes = availableSizesByApart.get(item.apartId) || [];
          const selectedSizes = selectedSizesByApart.get(item.apartId) || [];

          return (
            <div
              key={item.apartId}
              className="flex justify-between rounded border-l-4 bg-gray-100 py-3 pl-3 pr-2 lg:pl-4"
              style={{ borderColor: item.color }}
            >
              <div className="flex flex-1 flex-col gap-y-1 lg:flex-row lg:items-center lg:justify-between lg:gap-x-3">
                <span>{item.apartName}</span>
                {availableSizes.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {availableSizes.map(([minSize, maxSize]) => {
                      const isSelected = selectedSizes.some(
                        ([min, max]) => min === minSize && max === maxSize
                      );

                      const minPyeong = calculateAreaPyeong(minSize);
                      const maxPyeong = calculateAreaPyeong(maxSize);

                      return (
                        <Button
                          key={`${minSize}-${maxSize}`}
                          size="xs"
                          variant={isSelected ? 'primary-light' : 'ghost'}
                          className="lg:h-auto lg:rounded-full lg:py-2 lg:text-sm"
                          onClick={() =>
                            onToggleSize(item.apartId, [minSize, maxSize])
                          }
                        >
                          {minPyeong !== maxPyeong ? (
                            <>
                              {formatPyeongText(minPyeong)} ~{' '}
                              {formatPyeongText(maxPyeong)}
                            </>
                          ) : (
                            formatPyeongText(minPyeong)
                          )}
                        </Button>
                      );
                    })}
                  </div>
                ) : (
                  isLoadingSizes && (
                    <>
                      {/* 모바일: 스켈레톤 */}
                      <div className="flex flex-wrap gap-1 lg:hidden">
                        {[1, 2].map(i => (
                          <div
                            key={i}
                            className="h-[30px] w-[60px] animate-pulse rounded bg-gray-200"
                          />
                        ))}
                      </div>
                      {/* 데스크톱: 로딩 스피너 */}
                      <div className="hidden h-[33.5px] items-center lg:flex">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
                      </div>
                    </>
                  )
                )}
              </div>

              <div className="-mt-1.5 flex items-start lg:ml-4 lg:mt-[2px]">
                <Button
                  size="xs"
                  variant="ghost"
                  rounded
                  className="h-[32px] w-[32px] p-0 active:bg-gray-100 lg:active:bg-transparent"
                  onClick={() => onRemoveApartId(item.apartId)}
                >
                  <X size={16} />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </PageContainer>
  );
}
