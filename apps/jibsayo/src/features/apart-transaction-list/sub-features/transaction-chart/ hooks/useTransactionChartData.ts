'use client';

import { MonthlyTransactionItem } from '@/entities/apart-transaction';
import { calculateAreaPyeong } from '@/entities/transaction';
import { CHART_COLORS } from '@/features/apart-transaction-list/consts';

import { useMemo } from 'react';

import { TransactionChartData } from '../type';

interface Props {
  allSizes: [number, number][];
  monthlyData: MonthlyTransactionItem[];
}

export const useTransactionChartData = ({
  allSizes,
  monthlyData,
}: Props) => {
  // allSizes를 평형별로 매핑 (색상 할당을 위해)
  const pyeongColorMap = useMemo(() => {
    const map = new Map<number, string>();
    allSizes.forEach(([minSize, maxSize], index) => {
      // 문자열일 수 있으므로 Number로 변환
      const min = Number(minSize);
      const max = Number(maxSize);
      const avgSize = (min + max) / 2;
      const pyeong = calculateAreaPyeong(avgSize);
      const color = CHART_COLORS[index % CHART_COLORS.length];
      map.set(pyeong, color);
    });
    return map;
  }, [allSizes]);

  // 차트 데이터 계산
  const chartData = useMemo(() => {
    if (!monthlyData.length) return [];

    const result: TransactionChartData[] = [];

    // 월별 데이터 순회
    monthlyData.forEach(monthItem => {
      // month를 Date로 변환 (YYYYMM -> YYYY-MM-01)
      const monthStr = monthItem.month.toString();
      const year = monthStr.slice(0, 4);
      const month = monthStr.slice(4, 6);
      const date = new Date(`${year}-${month}-01`);

      // 평형별 거래 데이터 순회
      monthItem.transactions.forEach(transaction => {
        const [minSize, maxSize] = transaction.sizes;
        // 평형 계산 (범위의 중간값 사용)
        const avgSize = (minSize + maxSize) / 2;
        const pyeong = calculateAreaPyeong(avgSize);

        // 평형으로 색상 찾기
        const color = pyeongColorMap.get(pyeong) || '#3b82f6';

        result.push({
          date: date,
          averagePrice: transaction.averageAmount,
          count: transaction.count,
          size: minSize,
          sizes: [minSize, maxSize],
          pyeong: pyeong,
          color: color,
        });
      });
    });

    return result.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [monthlyData, pyeongColorMap]);

  // 범례 데이터 계산
  const legendData = useMemo(() => {
    if (!allSizes.length) return [];

    // allSizes의 순서를 그대로 사용하여 색상 할당
    return allSizes.map(([minSize, maxSize], index) => {
      // 문자열일 수 있으므로 Number로 변환
      const min = Number(minSize);
      const max = Number(maxSize);
      const avgSize = (min + max) / 2;
      const pyeong = calculateAreaPyeong(avgSize);
      const sizes = min === max ? [min] : [min, max].sort((a, b) => a - b);

      return {
        pyeong,
        color: CHART_COLORS[index % CHART_COLORS.length],
        sizes,
      };
    });
  }, [allSizes]);

  return {
    chartData,
    legendData,
  };
};
