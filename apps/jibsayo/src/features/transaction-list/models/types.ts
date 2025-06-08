import { TransactionsResponse } from '@/app/api/transactions/types';

import { SortingState } from '@package/ui';

export interface Transaction {
  apartId: string;
  apartName: string;
  buildedYear: number | null;
  householdsNumber: number | null;
  address: string;
  tradeDate: string;
  size: number | null;
  floor: number | null;
  isNewRecord: boolean;
  tradeAmount: number;
  maxTradeAmount: number;
}

export interface TransactionItem extends Transaction {
  favorite: boolean;
}

export interface TransactionViewSetting {
  sorting: SortingState;
  pageSize: number;
}

export interface TransactionFilter {
  apartName: string;
  isNationalSizeOnly: boolean;
  isFavoriteOnly: boolean;
}
