import { useMonthlyTransactionsByAparts } from '@/entities/transaction';

import { CHART_HEIGHT } from '../consts';
import { ChartLegendItem, PeriodValue } from '../types';
import { useCompareChartData } from './useCompareChartData';
import { useCompareChartView } from './useCompareChartView';

interface Props {
  selectedApartIds: number[];
  selectedPeriod: PeriodValue;
}

interface Return {
  svgRef: React.RefObject<SVGSVGElement>;
  isLoading: boolean;
  legendData: ChartLegendItem[];
}

export const useCompareChart = ({
  selectedApartIds,
  selectedPeriod,
}: Props): Return => {
  const { isFetching, data } = useMonthlyTransactionsByAparts({
    apartIds: selectedApartIds,
    period: selectedPeriod || undefined,
  });

  const { chartData, legendData } = useCompareChartData({
    selectedApartIds,
    monthlyData: data || [],
  });

  const { svgRef, isLoading } = useCompareChartView({
    chartData,
    height: CHART_HEIGHT,
  });

  return { svgRef, isLoading: isLoading || isFetching, legendData };
};
