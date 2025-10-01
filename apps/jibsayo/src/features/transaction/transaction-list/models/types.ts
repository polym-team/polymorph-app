import { SearchParams } from '@/entities/transaction';

export interface TransactionFilter {
  apartName: SearchParams['apartName'];
  minSize: SearchParams['minSize'];
  maxSize: SearchParams['maxSize'];
  favoriteOnly: SearchParams['favoriteOnly'];
  newTransactionOnly: SearchParams['newTransactionOnly'];
}
