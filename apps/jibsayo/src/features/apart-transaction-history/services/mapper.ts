import { ApartDetailTradeHistoryItem } from '@/app/api/apart/types';
import { calculateAreaPyeong } from '@/shared/services/transactionService';

import { TradeItemWithPriceChangeRate } from '../models/types';

export const mapTradeItemsWithPriceChangeRate = (
  tradeItems: ApartDetailTradeHistoryItem[]
): TradeItemWithPriceChangeRate[] => {
  // 거래일 기준으로 정렬 (최신순)
  const sortedItems = [...tradeItems].sort(
    (a, b) => new Date(b.tradeDate).getTime() - new Date(a.tradeDate).getTime()
  );

  return sortedItems.map((item, index) => {
    const currentPyeong = calculateAreaPyeong(item.size);

    // 같은 평수의 직전 거래 찾기
    const previousSamePyeongItem = sortedItems
      .slice(index + 1) // 현재 아이템 이후의 거래들 중에서
      .find(prevItem => calculateAreaPyeong(prevItem.size) === currentPyeong);

    let priceChangeRate = 1; // 기본값

    if (previousSamePyeongItem) {
      // 등락율 계산: ((현재가격 - 이전가격) / 이전가격) * 100
      const changeRate =
        ((item.tradeAmount - previousSamePyeongItem.tradeAmount) /
          previousSamePyeongItem.tradeAmount) *
        100;
      // 소수점 2자리까지만 버림 처리
      priceChangeRate = Math.floor(changeRate * 100) / 100;
    }

    return {
      ...item,
      priceChangeRate,
    };
  });
};
