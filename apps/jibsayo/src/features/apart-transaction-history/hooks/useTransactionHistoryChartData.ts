'use client';

import { ApartDetailResponse } from '@/app/api/apart/types';
import { calculateAreaPyeong } from '@/shared/services/transactionService';

import * as d3 from 'd3';
import { useMemo } from 'react';

import { CHART_COLORS } from '../../apart-detail-legacy/consts/colors';

export interface TransactionHistoryChartData {
  date: Date;
  averagePrice: number;
  count: number;
  size: number;
  sizes?: number[];
  pyeong: number;
}

export interface LegendItem {
  pyeong: number;
  color: string;
  sizes: number[];
}

interface Props {
  tradeItems: ApartDetailResponse['tradeItems'];
  allSizes: number[];
}

export const useTransactionHistoryChartData = ({
  tradeItems,
  allSizes,
}: Props) => {
  // 차트 데이터 계산
  const chartData = useMemo(() => {
    if (!tradeItems.length) return [];

    // 월별로 그룹화
    const monthlyData = d3.group(tradeItems, d =>
      d3.timeMonth(new Date(d.tradeDate))
    );

    const result: TransactionHistoryChartData[] = [];

    // 각 월별로 평형대별 데이터 생성
    Array.from(monthlyData, ([date, items]) => {
      if (items.length > 0) {
        // 평형대별로 그룹화
        const pyeongGroups = d3.group(items, d => calculateAreaPyeong(d.size));

        Array.from(pyeongGroups, ([pyeong, pyeongItems]) => {
          const validItems = pyeongItems.filter(item => item.tradeAmount > 0);

          if (validItems.length > 0) {
            const allSizes = Array.from(
              new Set(validItems.map(item => item.size))
            ).sort((a, b) => a - b);

            result.push({
              date: date,
              averagePrice: d3.mean(validItems, d => d.tradeAmount) || 0,
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
  }, [tradeItems]);

  // 범례 데이터 계산
  const legendData = useMemo(() => {
    if (!tradeItems.length) return [];

    // 이미 정렬된 평형 배열 사용
    return allSizes.map((pyeong, index) => {
      const items = tradeItems.filter(
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
  }, [tradeItems, allSizes]);

  return {
    chartData,
    legendData,
  };
};
