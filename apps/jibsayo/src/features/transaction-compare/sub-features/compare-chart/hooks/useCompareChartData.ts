'use client';

import { MonthlyTransactionsByApartsItem } from '@/entities/transaction';

import { useMemo } from 'react';

import { CHART_COLORS } from '../consts';
import { CompareChartData } from '../types';

interface Props {
  selectedApartIds: number[];
  monthlyData: MonthlyTransactionsByApartsItem[];
}

export const useCompareChartData = ({
  selectedApartIds,
  monthlyData,
}: Props) => {
  const apartColorMap = useMemo(() => {
    const map = new Map<number, string>();
    selectedApartIds.forEach((apartId, index) => {
      const color = CHART_COLORS[index % CHART_COLORS.length];
      map.set(apartId, color);
    });
    return map;
  }, [selectedApartIds]);

  const chartData = useMemo(() => {
    if (!monthlyData.length) return [];

    const result: CompareChartData[] = [];

    monthlyData.forEach(monthItem => {
      const monthStr = monthItem.month.toString();
      const year = monthStr.slice(0, 4);
      const month = monthStr.slice(4, 6);
      const date = new Date(`${year}-${month}-01`);

      monthItem.transactions.forEach(transaction => {
        const color = apartColorMap.get(transaction.id) || '#3b82f6';

        result.push({
          date: date,
          apartId: transaction.id,
          apartName: transaction.apartName,
          averagePrice: transaction.averageAmount,
          color: color,
        });
      });
    });

    return result.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [monthlyData, apartColorMap]);

  const legendData = useMemo(() => {
    if (!selectedApartIds.length || !chartData.length) return [];

    const apartMap = new Map<number, string>();
    chartData.forEach(d => {
      if (!apartMap.has(d.apartId)) {
        apartMap.set(d.apartId, d.apartName);
      }
    });

    return selectedApartIds
      .map((apartId, index) => ({
        apartId,
        apartName: apartMap.get(apartId) || '',
        color: CHART_COLORS[index % CHART_COLORS.length],
      }))
      .filter(item => item.apartName);
  }, [selectedApartIds, chartData]);

  return {
    chartData,
    legendData,
  };
};
