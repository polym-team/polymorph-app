import { TransactionItem } from '@/entities/transaction';

export interface TransactionDetailItem extends TransactionItem {
  isFavorite: boolean;
  isNewTransaction: boolean;
}
