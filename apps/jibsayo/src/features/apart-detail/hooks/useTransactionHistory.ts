import { ApartDetailResponse } from '@/app/api/apart/types';
import { TransactionItem } from '@/shared/models/types';

import { useState } from 'react';

import { SortingState } from '@package/ui';

import {
  calculatePriceChange,
  calculatePricePerPyeong,
  calculatePyeong,
} from '../services/calculator';

export function useTransactionHistory(
  items: ApartDetailResponse['tradeItems']
) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'tradeDate', desc: true },
  ]);
  const [pageSize, setPageSize] = useState(50);

  const processedItems: TransactionItem[] = items
    ? items
        .map((item, index) => {
          const pyeong = calculatePyeong(item.size);
          const pricePerPyeong = calculatePricePerPyeong(
            item.tradeAmount,
            item.size
          );

          // 가격 트렌드 계산 (같은 면적의 이전 거래와 비교)
          let priceChange: TransactionItem['priceChange'] = null;
          const prevSimilarItem = items
            .slice(index + 1)
            .find(prevItem => Math.abs(prevItem.size - item.size) <= 5); // 5㎡ 오차 허용

          if (prevSimilarItem) {
            const prevPricePerPyeong = calculatePricePerPyeong(
              prevSimilarItem.tradeAmount,
              prevSimilarItem.size
            );

            priceChange = calculatePriceChange(
              pricePerPyeong,
              prevPricePerPyeong
            );
          }

          return {
            ...item,
            pyeong,
            pricePerPyeong,
            priceChange,
          };
        })
        .sort(
          (a, b) =>
            new Date(b.tradeDate).getTime() - new Date(a.tradeDate).getTime()
        )
    : [];

  return {
    processedItems,
    sorting,
    setSorting,
    pageSize,
    setPageSize,
  };
}
