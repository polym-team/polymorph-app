import { FavoriteApartItem } from '@/entities/apart/models/types';
import { TransactionItem } from '@/entities/transaction';

import { TransactionDetailItem } from '../models/types';

export const mapTramsactionItemWithFavorite = (
  transaction: TransactionItem[],
  newTransactionIds: string[],
  favoriteApartList: FavoriteApartItem[]
): TransactionDetailItem[] => {
  const calculateIsFavorite = (item: TransactionItem) => {
    return favoriteApartList.some(
      favoriteApart => favoriteApart.apartId === item.apartId
    );
  };

  const calculateIsNew = (item: TransactionItem) => {
    return newTransactionIds.includes(item.transactionId);
  };

  return transaction.map(item => ({
    ...item,
    isNew: calculateIsNew(item),
    isFavorite: calculateIsFavorite(item),
  }));
};
