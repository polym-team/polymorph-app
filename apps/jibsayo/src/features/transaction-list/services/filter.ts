import { FavoriteApartItem } from '@/entities/apart/models/types';
import { RULES, SearchParams, TransactionItem } from '@/entities/transaction';
import {
  calculateAreaPyeong,
  createApartItemKey,
} from '@/shared/services/transactionService';

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
  favoriteApartList: FavoriteApartItem[],
  searchParams: SearchParams
) => {
  if (!searchParams.favoriteOnly) {
    return true;
  }
  return favoriteApartList.some(favoriteApart => {
    const currentApartItemKey = createApartItemKey(favoriteApart);
    const targetApartItemKey = createApartItemKey({
      regionCode: favoriteApart.regionCode,
      address: transaction.address,
      apartName: transaction.apartName,
    });
    return currentApartItemKey === targetApartItemKey;
  });
};

export const filterTransactionItemWithNewTransaction = (
  transaction: TransactionItem,
  searchParams: SearchParams
) => {
  if (!searchParams.newTransactionOnly) {
    return true;
  }
  return transaction.isNew;
};

export const filterFavoriteApartListWithRegionCode = (
  searchParams: SearchParams,
  favoriteApartList: FavoriteApartItem[]
) => {
  return favoriteApartList.filter(
    item => item.regionCode === searchParams.regionCode
  );
};
