import { useMonthlyTransactionsByAparts } from '@/entities/transaction';
import { useDebounce } from '@/shared/hooks/useDebounce';

import { useMemo } from 'react';

import { CHART_HEIGHT } from '../consts';
import { ChartLegendItem, PeriodValue } from '../types';
import { useCompareChartData } from './useCompareChartData';
import { useCompareChartView } from './useCompareChartView';

interface Props {
  selectedApartIds: number[];
  selectedPeriod: PeriodValue;
  selectedSizesByApart: Map<number, [number, number][]>;
  availableSizesByApart: Map<number, [number, number][]>;
}

interface Return {
  svgRef: React.RefObject<SVGSVGElement>;
  isLoading: boolean;
  legendData: ChartLegendItem[];
  data: ReturnType<typeof useMonthlyTransactionsByAparts>['data'];
}

export const useCompareChart = ({
  selectedApartIds,
  selectedPeriod,
  selectedSizesByApart,
  availableSizesByApart,
}: Props): Return => {
  const sizesByApartRecord = useMemo(() => {
    if (selectedSizesByApart.size === 0) return undefined;

    // 모든 아파트의 availableSizes가 로드되었는지 확인
    const allApartsHaveAvailableSizes = selectedApartIds.every(apartId =>
      availableSizesByApart.has(apartId)
    );

    // availableSizes가 로드되지 않은 아파트가 있으면 sizes 필터링 없이 조회
    if (!allApartsHaveAvailableSizes) {
      return undefined;
    }

    // 모든 평형이 선택되었는지 확인
    let allSizesSelected = true;
    for (const apartId of selectedApartIds) {
      const availableSizes = availableSizesByApart.get(apartId) || [];
      const selectedSizes = selectedSizesByApart.get(apartId) || [];

      if (availableSizes.length !== selectedSizes.length) {
        allSizesSelected = false;
        break;
      }
    }

    // 모든 평형이 선택된 경우 sizes를 전달하지 않음 (전체 데이터 조회)
    if (allSizesSelected) {
      return undefined;
    }

    const record: Record<number, [number, number][]> = {};
    selectedSizesByApart.forEach((sizes, apartId) => {
      record[apartId] = sizes;
    });

    return record;
  }, [selectedSizesByApart, availableSizesByApart, selectedApartIds]);

  // 파라미터를 debounce 처리 (500ms)
  const debouncedPeriod = useDebounce(selectedPeriod, 500);
  const debouncedSizesByApart = useDebounce(sizesByApartRecord, 500);

  const { isFetching, data } = useMonthlyTransactionsByAparts({
    apartIds: selectedApartIds,
    period: debouncedPeriod || undefined,
    sizesByApart: debouncedSizesByApart,
  });

  const { chartData, legendData, apartStatsMap } = useCompareChartData({
    selectedApartIds,
    monthlyData: Array.isArray(data) ? data : [],
  });

  const { svgRef, isLoading } = useCompareChartView({
    chartData,
    apartStatsMap,
    height: CHART_HEIGHT,
  });

  return { svgRef, isLoading: isLoading || isFetching, legendData, data };
};
