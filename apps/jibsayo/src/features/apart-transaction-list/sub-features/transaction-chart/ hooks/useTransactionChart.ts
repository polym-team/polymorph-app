import { ApartTransactionItem } from '@/entities/apart-transaction';

import { CHART_HEIGHT } from '../consts';
import { useTransactionChartData } from './useTransactionChartData';
import { useTransactionChartView } from './useTransactionChartView';

interface Props {
  allSizes: number[];
  tradeItems: ApartTransactionItem[];
}

interface Return {
  svgRef: React.RefObject<SVGSVGElement>;
  isLoading: boolean;
}

export const useTransactionChart = ({
  allSizes,
  tradeItems,
}: Props): Return => {
  const { chartData, legendData } = useTransactionChartData({
    tradeItems,
    allSizes,
  });

  const { svgRef, isLoading } = useTransactionChartView({
    chartData,
    legendData,
    height: CHART_HEIGHT,
  });

  return { svgRef, isLoading };
};
