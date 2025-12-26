'use client';

import { ApartTransactionSummary } from '@/entities/transaction';

import { useMemo } from 'react';

import { CHART_COLORS } from '../consts';
import { CompareChartData } from '../types';

interface Props {
  selectedApartIds: number[];
  monthlyData: ApartTransactionSummary[];
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

    monthlyData.forEach(apartData => {
      const color = apartColorMap.get(apartData.apartId) || '#3b82f6';

      apartData.transactions.forEach(monthTransaction => {
        const monthStr = monthTransaction.month.toString();
        const year = monthStr.slice(0, 4);
        const month = monthStr.slice(4, 6);
        const date = new Date(`${year}-${month}-01`);

        result.push({
          date: date,
          apartId: apartData.apartId,
          apartName: apartData.apartName,
          averagePrice: monthTransaction.averageAmount,
          count: monthTransaction.count,
          color: color,
        });
      });
    });

    return result.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [monthlyData, apartColorMap]);

  const legendData = useMemo(() => {
    if (!selectedApartIds.length || !monthlyData.length) return [];

    const apartMap = new Map<
      number,
      { apartName: string; totalCount: number; totalAmount: number; count: number }
    >();

    monthlyData.forEach(apartData => {
      if (!apartMap.has(apartData.apartId)) {
        apartMap.set(apartData.apartId, {
          apartName: apartData.apartName,
          totalCount: 0,
          totalAmount: 0,
          count: 0,
        });
      }

      const data = apartMap.get(apartData.apartId)!;
      apartData.transactions.forEach(monthTransaction => {
        data.totalCount += monthTransaction.count;
        data.totalAmount += monthTransaction.averageAmount * monthTransaction.count;
        data.count += monthTransaction.count;
      });
    });

    return selectedApartIds
      .map((apartId, index) => {
        const data = apartMap.get(apartId);
        if (!data) return null;

        return {
          apartId,
          apartName: data.apartName,
          color: CHART_COLORS[index % CHART_COLORS.length],
          totalCount: data.totalCount,
          averageAmount: data.count > 0 ? Math.round(data.totalAmount / data.count) : 0,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  }, [selectedApartIds, monthlyData]);

  const apartStatsMap = useMemo(() => {
    const map = new Map<number, { totalCount: number; averageAmount: number }>();

    monthlyData.forEach(apartData => {
      let totalCount = 0;
      let totalAmount = 0;
      let count = 0;

      apartData.transactions.forEach(monthTransaction => {
        totalCount += monthTransaction.count;
        totalAmount += monthTransaction.averageAmount * monthTransaction.count;
        count += monthTransaction.count;
      });

      map.set(apartData.apartId, {
        totalCount,
        averageAmount: count > 0 ? Math.round(totalAmount / count) : 0,
      });
    });

    return map;
  }, [monthlyData]);

  return {
    chartData,
    legendData,
    apartStatsMap,
  };
};
