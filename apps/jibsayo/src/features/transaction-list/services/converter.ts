import { FavoriteApartItem } from '@/entities/apart';
import {
  SEARCH_PARAM_CONFIGS,
  SearchParams,
  TransactionItem,
} from '@/entities/transaction';
import { calculateAreaPyeong } from '@/entities/transaction';

import { TRANSACTION_LIST_PAGE_SIZE } from '../consts';
import { Sorting, TransactionItemViewModel } from '../types';

export const sortTransactionList = (
  transactionList: TransactionItem[],
  sorting: Sorting
): TransactionItem[] => {
  return [...transactionList].sort((a, b) => {
    if (sorting.id === 'tradeDate') {
      return sorting.desc
        ? new Date(b.tradeDate).getTime() - new Date(a.tradeDate).getTime()
        : new Date(a.tradeDate).getTime() - new Date(b.tradeDate).getTime();
    } else if (sorting.id === 'tradeAmount') {
      return sorting.desc
        ? b.tradeAmount - a.tradeAmount
        : a.tradeAmount - b.tradeAmount;
    }
    return 0;
  });
};

export const sliceTransactionList = (
  transactionList: TransactionItem[],
  pageIndex: number
): TransactionItem[] => {
  return transactionList.slice(
    pageIndex * TRANSACTION_LIST_PAGE_SIZE,
    (pageIndex + 1) * TRANSACTION_LIST_PAGE_SIZE
  );
};

export const filterTransactionItemWithApartName = (
  transaction: TransactionItem,
  searchParams: SearchParams
): boolean => {
  if (!searchParams.apartName) {
    return true;
  }
  return transaction.apartName
    .toLowerCase()
    .includes(searchParams.apartName.toLowerCase());
};

export const filterTransactionItemWithSize = (
  transaction: TransactionItem,
  searchParams: SearchParams
): boolean => {
  if (
    !searchParams.minSize ||
    !searchParams.maxSize ||
    (searchParams.minSize === SEARCH_PARAM_CONFIGS.SEARCH_MIN_SIZE &&
      searchParams.maxSize === Infinity)
  ) {
    return true;
  }
  const pyeong = calculateAreaPyeong(transaction.size);
  return pyeong >= searchParams.minSize && pyeong <= searchParams.maxSize;
};

export const filterTransactionItemWithFavorite = (
  transaction: TransactionItem,
  searchParams: SearchParams,
  favoriteApartIdSet: Set<string>
): boolean => {
  if (!searchParams.favoriteOnly) {
    return true;
  }
  return favoriteApartIdSet.has(transaction.apartId);
};

export const filterTransactionItemWithNewTransaction = (
  transaction: TransactionItem,
  searchParams: SearchParams,
  newTransactionIdSet: Set<string>
): boolean => {
  if (!searchParams.newTransactionOnly) {
    return true;
  }
  return newTransactionIdSet.has(transaction.transactionId);
};

export const convertToNewTransactionIdSet = (
  transactionIdList: string[]
): Set<string> => {
  return new Set(transactionIdList);
};

export const convertToFavoriteApartIdSet = (
  searchParams: SearchParams,
  favoriteApartList: FavoriteApartItem[]
): Set<string> => {
  const filteredFavoriteApartList = favoriteApartList.filter(
    item => item.regionCode === searchParams.regionCode
  );

  return new Set(filteredFavoriteApartList.map(item => item.apartId));
};

export const convertToTransactionListViewModel = (
  transaction: TransactionItem[],
  newTransactionIdSet: Set<string>,
  favoriteApartIdSet: Set<string>
): TransactionItemViewModel[] => {
  return transaction.map(item => ({
    ...item,
    isNew: newTransactionIdSet.has(item.transactionId),
    isFavorite: favoriteApartIdSet.has(item.apartId),
  }));
};
