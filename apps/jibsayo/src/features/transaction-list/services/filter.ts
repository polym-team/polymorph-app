import { FavoriteApartItem } from '@/entities/apart/models/types';
import { RULES, SearchParams, TransactionItem } from '@/entities/transaction';
import { calculateAreaPyeong } from '@/shared/services/transactionService';

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
