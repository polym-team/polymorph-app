import { TransactionsResponse } from '@/app/api/transactions/models/types';

export type TransactionItem = TransactionsResponse['list'][number];
