'use client';

import { ApartTransactionItem } from '@/entities/apart-transaction';
import { calculateAreaPyeong } from '@/entities/transaction';
import { CHART_COLORS } from '@/features/apart-transaction-list/consts';

import * as d3 from 'd3';
import { useMemo } from 'react';

import { TransactionChartData } from '../type';

interface Props {
  allSizes: number[];
  transactionItems: ApartTransactionItem[];
}

export const useTransactionChartData = ({
  allSizes,
  transactionItems,
}: Props) => {
  // 차트 데이터 계산
  const chartData = useMemo(() => {
    if (!transactionItems.length) return [];

    // 월별로 그룹화
    const monthlyData = d3.group(transactionItems, d =>
      d3.timeMonth(new Date(d.dealDate))
    );

    const result: TransactionChartData[] = [];

    // 각 월별로 평형대별 데이터 생성
    Array.from(monthlyData, ([date, items]) => {
      if (items.length > 0) {
        // 평형대별로 그룹화
        const pyeongGroups = d3.group(items, d => calculateAreaPyeong(d.size));

        Array.from(pyeongGroups, ([pyeong, pyeongItems]) => {
          const validItems = pyeongItems.filter(item => item.dealAmount > 0);

          if (validItems.length > 0) {
            const allSizes = Array.from(
              new Set(validItems.map(item => item.size))
            ).sort((a, b) => a - b);

            result.push({
              date: date,
              averagePrice: d3.mean(validItems, d => d.dealAmount) || 0,
              count: validItems.length,
              size: allSizes[0],
              sizes: allSizes,
              pyeong: pyeong,
            });
          }
        });
      }
    });

    return result.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [transactionItems]);

  // 범례 데이터 계산
  const legendData = useMemo(() => {
    if (!transactionItems.length) return [];

    // 이미 정렬된 평형 배열 사용
    return allSizes.map((pyeong, index) => {
      const items = transactionItems.filter(
        item => calculateAreaPyeong(item.size) === pyeong
      );
      const allSizesForPyeong = Array.from(
        new Set(items.map(item => item.size))
      ).sort((a, b) => a - b);

      return {
        pyeong,
        color: CHART_COLORS[index % CHART_COLORS.length],
        sizes: allSizesForPyeong,
      };
    });
  }, [transactionItems, allSizes]);

  return {
    chartData,
    legendData,
  };
};
