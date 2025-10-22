import { FavoriteApartItem } from '@/entities/apart/models/types';
import { TransactionItem } from '@/entities/transaction';
import { createApartItemKey } from '@/shared/services/transactionService';

import { TransactionDetailItem } from '../models/types';

export const mapTramsactionItemWithFavorite = (
  regionCode: string,
  transaction: TransactionItem[],
  favoriteApartList: FavoriteApartItem[],
  newTransactionIdList: string[]
): TransactionDetailItem[] => {
  const calculateIsFavorite = (item: TransactionItem) => {
    return favoriteApartList.some(favoriteApart => {
      const currentApartItemKey = createApartItemKey(favoriteApart);
      const targetApartItemKey = createApartItemKey({
        regionCode,
        address: item.address,
        apartName: item.apartName,
      });

      return currentApartItemKey === targetApartItemKey;
    });
  };

  const calculateIsNewTransaction = (item: TransactionItem) => {
    return newTransactionIdList.includes(item.apartId);
  };

  return transaction.map(item => ({
    ...item,
    isFavorite: calculateIsFavorite(item),
    isNewTransaction: calculateIsNewTransaction(item),
  }));
};
