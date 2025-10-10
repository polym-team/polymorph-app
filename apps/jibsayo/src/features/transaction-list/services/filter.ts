import { FavoriteApartItem } from '@/entities/apart/models/types';
import { RULES, SearchParams, TransactionItem } from '@/entities/transaction';
import {
  calculateAreaPyeong,
  createApartItemKey,
} from '@/shared/services/transactionService';

export const filterTransactionItemWithApartName = (
  transaction: TransactionItem,
  apartName: SearchParams['apartName']
) => {
  if (!apartName) {
    return true;
  }
  return transaction.apartName.toLowerCase().includes(apartName.toLowerCase());
};

export const filterTransactionItemWithSize = (
  transaction: TransactionItem,
  minSize: SearchParams['minSize'],
  maxSize: SearchParams['maxSize']
) => {
  if (
    !minSize ||
    !maxSize ||
    (minSize === RULES.SEARCH_MIN_SIZE && maxSize === RULES.SEARCH_MAX_SIZE)
  ) {
    return true;
  }
  const pyeong = calculateAreaPyeong(transaction.size);
  return pyeong >= minSize && pyeong <= maxSize;
};

export const filterTransactionItemWithFavorite = (
  transaction: TransactionItem,
  favoriteApartList: FavoriteApartItem[],
  favoriteOnly: SearchParams['favoriteOnly']
) => {
  if (!favoriteOnly) {
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
  newTransactionOnly: SearchParams['newTransactionOnly']
) => {
  if (!newTransactionOnly) {
    return true;
  }
  return false; // FIXME: 수정 필요
};

export const filterFavoriteApartListWithRegionCode = (
  regionCode: SearchParams['regionCode'],
  data: FavoriteApartItem[]
) => {
  return data.filter(item => item.regionCode === regionCode);
};
