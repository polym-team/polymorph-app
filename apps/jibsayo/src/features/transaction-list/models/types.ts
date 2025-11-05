import { TransactionItem } from '@/entities/transaction';

export interface TransactionDetailItem extends TransactionItem {
  isNew: boolean;
  isFavorite: boolean;
}
