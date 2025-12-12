import { useMonthlyTransactionQuery } from '@/entities/apart-transaction/hooks/useMonthlyTransactionQuery';
import {
  PeriodValue,
  SizesValue,
} from '@/features/apart-transaction-list/types';

import { CHART_HEIGHT } from '../consts';
import { useTransactionChartData } from './useTransactionChartData';
import { useTransactionChartView } from './useTransactionChartView';

interface Props {
  apartId: number;
  allSizes: SizesValue;
  selectedSizes: SizesValue;
  selectedPeriod: PeriodValue;
}

interface Return {
  svgRef: React.RefObject<SVGSVGElement>;
  isLoading: boolean;
}

export const useTransactionChart = ({
  apartId,
  allSizes,
  selectedSizes,
  selectedPeriod,
}: Props): Return => {
  const { isFetching, data } = useMonthlyTransactionQuery({
    apartId,
    sizes: allSizes.length === selectedSizes.length ? undefined : selectedSizes,
    period: selectedPeriod,
  });

  const { chartData, legendData } = useTransactionChartData({
    monthlyData: data || [],
    allSizes: allSizes,
  });

  const { svgRef, isLoading } = useTransactionChartView({
    chartData,
    legendData,
    height: CHART_HEIGHT,
  });

  return { svgRef, isLoading: isLoading || isFetching };
};
