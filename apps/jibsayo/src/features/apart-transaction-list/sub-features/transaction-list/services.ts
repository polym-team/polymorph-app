import { ApartTransactionItem } from '@/entities/apart-transaction';
import { calculateAreaPyeong } from '@/entities/transaction';

import { TRANSACTION_LIST_PAGE_SIZE } from './consts';
import { Sorting, TransactionItemViewModel } from './types';

const calculatePriceChange = ({
  transactionItems,
  item,
}: {
  transactionItems: ApartTransactionItem[];
  item: ApartTransactionItem;
}): {
  priceChangeRate: TransactionItemViewModel['priceChangeRate'];
  prevTransactionItem?: TransactionItemViewModel['prevTransactionItem'];
} => {
  const currentPyeong = calculateAreaPyeong(item.size);
  const currentDate = new Date(item.tradeDate);

  // 같은 평수의 직전 거래 찾기 (시간상 가장 가까운 이전 거래)
  const prevTransactionItem = transactionItems
    .filter(prevItem => {
      const prevPyeong = calculateAreaPyeong(prevItem.size);
      const prevDate = new Date(prevItem.tradeDate);
      return prevPyeong === currentPyeong && prevDate < currentDate;
    })
    .sort(
      (a, b) =>
        new Date(b.tradeDate).getTime() - new Date(a.tradeDate).getTime()
    )[0]; // 최신순 정렬 // 가장 최근의 이전 거래

  let priceChangeRate = 0; // 기본값 (이전 거래가 없으면 0)

  if (prevTransactionItem) {
    // 등락율 계산: ((현재가격 - 이전가격) / 이전가격) * 100
    const changeRate =
      ((item.tradeAmount - prevTransactionItem.tradeAmount) /
        prevTransactionItem.tradeAmount) *
      100;
    // 소수점 2자리까지만 버림 처리
    priceChangeRate = Math.floor(changeRate * 100) / 100;
  }

  return {
    ...item,
    priceChangeRate,
    prevTransactionItem,
  };
};

const calculateNewTransaction = ({
  item,
  newTransactionIdsSet,
}: {
  item: ApartTransactionItem;
  newTransactionIdsSet: Set<string>;
}): {
  isNewTransaction: TransactionItemViewModel['isNewTransaction'];
} => {
  const isNewTransaction = newTransactionIdsSet.has(item.transactionId);

  return { isNewTransaction };
};

export const sortTransactionItems = ({
  transactionItems,
  sorting,
}: {
  transactionItems: ApartTransactionItem[];
  sorting: Sorting;
}) => {
  const sortedItem = sorting[0];

  return [...transactionItems].sort((a, b) => {
    const aValue = a[sortedItem.id];
    const bValue = b[sortedItem.id];

    if (aValue < bValue) {
      return sortedItem.desc ? 1 : -1;
    }
    if (aValue > bValue) {
      return sortedItem.desc ? -1 : 1;
    }
    return 0;
  });
};

export const sliceTransactionItems = ({
  transactionItems,
  pageIndex,
}: {
  transactionItems: ApartTransactionItem[];
  pageIndex: number;
}): ApartTransactionItem[] => {
  return transactionItems.slice(
    pageIndex * TRANSACTION_LIST_PAGE_SIZE,
    (pageIndex + 1) * TRANSACTION_LIST_PAGE_SIZE
  );
};

export const convertToTransactionItem = ({
  transactionItems,
  newTransactionIdsSet,
}: {
  transactionItems: ApartTransactionItem[];
  newTransactionIdsSet: Set<string>;
}): TransactionItemViewModel[] => {
  return transactionItems.map(item => ({
    ...item,
    ...calculatePriceChange({ transactionItems, item }),
    ...calculateNewTransaction({
      newTransactionIdsSet,
      item,
    }),
  }));
};

export const calculateTargetPageIndex = ({
  transactionItems,
  selectedMonth,
  sorting,
}: {
  transactionItems: ApartTransactionItem[];
  selectedMonth: string | null;
  sorting: Sorting;
}): number => {
  if (!selectedMonth) {
    return 0;
  }

  // 정렬된 거래 목록에서 선택된 월의 첫 번째 거래 찾기
  const sortedItems = sortTransactionItems({ transactionItems, sorting });
  const targetIndex = sortedItems.findIndex(item =>
    item.tradeDate.startsWith(selectedMonth)
  );

  // 못 찾으면 0, 찾으면 해당 인덱스를 페이지 크기로 나눈 값
  if (targetIndex === -1) {
    return 0;
  }

  return Math.floor(targetIndex / TRANSACTION_LIST_PAGE_SIZE);
};
