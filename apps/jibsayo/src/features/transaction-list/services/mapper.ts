import { FavoriteApartItem } from '@/entities/apart/models/types';
import { TransactionItem } from '@/entities/transaction';
import { createApartItemKey } from '@/shared/services/transactionService';

import { TransactionDetailItem } from '../models/types';

export const mapTramsactionItemWithFavorite = (
  regionCode: string,
  transaction: TransactionItem[],
  favoriteApartList: FavoriteApartItem[]
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

  return transaction.map(item => ({
    ...item,
    isFavorite: calculateIsFavorite(item),
  }));
};
