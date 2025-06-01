import { TransactionsResponse } from '@/app/api/transactions/types';

import { SortingState } from '@package/ui';

type Transaction = TransactionsResponse['list'][number];

export interface TransactionItem extends Transaction {
  favorite: boolean;
}

export interface TransactionViewSetting {
  sorting: SortingState;
  pageSize: number;
}
