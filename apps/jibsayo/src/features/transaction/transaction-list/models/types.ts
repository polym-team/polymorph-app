import { TransactionItem } from '@/entities/transaction';

export interface TransactionItemWithFavorite extends TransactionItem {
  isFavorite: boolean;
}
