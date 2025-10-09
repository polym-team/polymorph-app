import { TransactionsResponse } from '@/app/api/transactions/types';

export type TransactionItem = TransactionsResponse['list'][number];

export interface SearchParams {
  regionCode: string;
  tradeDate: string;
  pageIndex: number;
  apartName: string;
  minSize: number;
  maxSize: number;
  favoriteOnly: boolean;
  newTransactionOnly: boolean;
}

export interface DataTableCellProps {
  apartName: string;
  tradeDate: string;
  tradeAmount: number;
  floor: number | null;
  size: number;
}
