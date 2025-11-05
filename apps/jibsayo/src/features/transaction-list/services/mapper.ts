import { FavoriteApartItem } from '@/entities/apart/models/types';
import { TransactionItem } from '@/entities/transaction';

import { TransactionDetailItem } from '../models/types';

export const mapTramsactionItemWithFavorite = (
  regionCode: string,
  transaction: TransactionItem[],
  favoriteApartList: FavoriteApartItem[]
): TransactionDetailItem[] => {
  const calculateIsFavorite = (item: TransactionItem) => {
    return favoriteApartList.some(
      favoriteApart => favoriteApart.apartId === item.apartId
    );
  };

  return transaction.map(item => ({
    ...item,
    isFavorite: calculateIsFavorite(item),
  }));
};
