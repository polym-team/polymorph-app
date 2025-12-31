import { useMonthlyTransactionsByAparts } from '@/entities/transaction';

import { useMemo } from 'react';

import { CHART_HEIGHT } from '../consts';
import { ChartLegendItem, PeriodValue } from '../types';
import { useCompareChartData } from './useCompareChartData';
import { useCompareChartView } from './useCompareChartView';

interface Props {
  selectedApartIds: number[];
  selectedPeriod: PeriodValue;
  selectedSizesByApart: Map<number, [number, number][]>;
}

interface Return {
  svgRef: React.RefObject<SVGSVGElement>;
  isLoading: boolean;
  legendData: ChartLegendItem[];
}

export const useCompareChart = ({
  selectedApartIds,
  selectedPeriod,
  selectedSizesByApart,
}: Props): Return => {
  const sizesByApartRecord = useMemo(() => {
    if (selectedSizesByApart.size === 0) return undefined;

    const record: Record<number, [number, number][]> = {};
    selectedSizesByApart.forEach((sizes, apartId) => {
      record[apartId] = sizes;
    });

    return record;
  }, [selectedSizesByApart]);

  const { isFetching, data } = useMonthlyTransactionsByAparts({
    apartIds: selectedApartIds,
    period: selectedPeriod || undefined,
    sizesByApart: sizesByApartRecord,
  });

  const { chartData, legendData, apartStatsMap } = useCompareChartData({
    selectedApartIds,
    monthlyData: data || [],
  });

  const { svgRef, isLoading } = useCompareChartView({
    chartData,
    apartStatsMap,
    height: CHART_HEIGHT,
  });

  return { svgRef, isLoading: isLoading || isFetching, legendData };
};
