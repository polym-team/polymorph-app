import { ApartDetailTradeHistoryItem } from '@/app/api/apart/models/types';
import { calculateAreaPyeong } from '@/shared/services/transactionService';

import { TradeItemViewModel } from '../models/types';

const mapWithPriceChangeData = ({
  tradeItems,
  item,
}: {
  tradeItems: ApartDetailTradeHistoryItem[];
  item: ApartDetailTradeHistoryItem;
}): {
  priceChangeRate: TradeItemViewModel['priceChangeRate'];
  previousTradeItem?: TradeItemViewModel['previousTradeItem'];
} => {
  const currentPyeong = calculateAreaPyeong(item.size);
  const currentDate = new Date(item.tradeDate);

  // 같은 평수의 직전 거래 찾기 (시간상 가장 가까운 이전 거래)
  const previousSamePyeongItem = tradeItems
    .filter(prevItem => {
      const prevPyeong = calculateAreaPyeong(prevItem.size);
      const prevDate = new Date(prevItem.tradeDate);
      return prevPyeong === currentPyeong && prevDate < currentDate;
    })
    .sort(
      (a, b) =>
        new Date(b.tradeDate).getTime() - new Date(a.tradeDate).getTime()
    )[0]; // 최신순 정렬 // 가장 최근의 이전 거래

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
    previousTradeItem: previousSamePyeongItem,
  };
};

const mapWithIsNewTransaction = ({
  item,
  newTransactionIds,
}: {
  item: ApartDetailTradeHistoryItem;
  newTransactionIds: string[];
}): {
  isNewTransaction: TradeItemViewModel['isNewTransaction'];
} => {
  const isNewTransaction = newTransactionIds.includes(item.transactionId);

  return { isNewTransaction };
};

export const mapTradeHistoryItems = ({
  tradeItems,
  newTransactionIds,
}: {
  tradeItems: ApartDetailTradeHistoryItem[];
  newTransactionIds: string[];
}): TradeItemViewModel[] => {
  return tradeItems.map(item => ({
    ...item,
    ...mapWithPriceChangeData({ tradeItems, item }),
    ...mapWithIsNewTransaction({ newTransactionIds, item }),
  }));
};
