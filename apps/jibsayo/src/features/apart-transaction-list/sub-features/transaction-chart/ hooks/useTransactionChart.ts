import { ApartTransactionItem } from '@/entities/apart-transaction';

import { CHART_HEIGHT } from '../consts';
import { useTransactionChartData } from './useTransactionChartData';
import { useTransactionChartView } from './useTransactionChartView';

interface Props {
  allSizes: number[];
  transactionItems: ApartTransactionItem[];
}

interface Return {
  svgRef: React.RefObject<SVGSVGElement>;
  isLoading: boolean;
}

export const useTransactionChart = ({
  allSizes,
  transactionItems,
}: Props): Return => {
  const { chartData, legendData } = useTransactionChartData({
    transactionItems,
    allSizes,
  });

  const { svgRef, isLoading } = useTransactionChartView({
    chartData,
    legendData,
    height: CHART_HEIGHT,
  });

  return { svgRef, isLoading };
};
