import { FavoriteApartItem } from '@/entities/apart/models/types';
import { TransactionItem } from '@/entities/transaction';
import { createApartItemKey } from '@/shared/services/transactionService';

export const mapTramsactionItemWithFavorite = (
  regionCode: string,
  transaction: TransactionItem[],
  favoriteApartList: FavoriteApartItem[]
) => {
  return transaction.map(item => ({
    ...item,
    isFavorite: favoriteApartList.some(favoriteApart => {
      const currentApartItemKey = createApartItemKey(favoriteApart);
      const targetApartItemKey = createApartItemKey({
        regionCode,
        address: item.address,
        apartName: item.apartName,
      });

      return currentApartItemKey === targetApartItemKey;
    }),
  }));
};
