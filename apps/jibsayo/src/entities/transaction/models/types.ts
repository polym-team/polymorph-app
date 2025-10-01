import { TransactionsResponse } from '@/app/api/transactions/types';

export type TransactionItem = TransactionsResponse['list'][number];

export interface SearchParams {
  regionCode: string;
  tradeDate: string;
  pageIndex: string;
  apartName: string;
  minSize: number;
  maxSize: number;
  favoriteOnly: boolean;
  newTransactionOnly: boolean;
}
