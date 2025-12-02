import { TransactionsResponse } from '@/app/api/transactions/types';

export type TransactionItem = TransactionsResponse['list'][number];
