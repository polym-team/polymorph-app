import { FavoriteApartItem } from '@/entities/apart/models/types';
import { RULES, SearchParams, TransactionItem } from '@/entities/transaction';
import { calculateAreaPyeong } from '@/shared/services/transactionService';

import { TRANSACTION_LIST_PAGE_SIZE } from '../consts/rules';
import { Sorting } from '../models/types';

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
) => {
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
) => {
  if (
    !searchParams.minSize ||
    !searchParams.maxSize ||
    (searchParams.minSize === RULES.SEARCH_MIN_SIZE &&
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
  favoriteApartList: FavoriteApartItem[]
) => {
  if (!searchParams.favoriteOnly) {
    return true;
  }
  return favoriteApartList.some(
    favoriteApart => favoriteApart.apartId === transaction.apartId
  );
};

export const filterTransactionItemWithNewTransaction = (
  transaction: TransactionItem,
  searchParams: SearchParams,
  newTransactionList: TransactionItem[]
) => {
  if (!searchParams.newTransactionOnly) {
    return true;
  }
  return newTransactionList.some(
    newTransaction => newTransaction.transactionId === transaction.transactionId
  );
};

export const filterFavoriteApartListWithRegionCode = (
  searchParams: SearchParams,
  favoriteApartList: FavoriteApartItem[]
) => {
  return favoriteApartList.filter(
    item => item.regionCode === searchParams.regionCode
  );
};
