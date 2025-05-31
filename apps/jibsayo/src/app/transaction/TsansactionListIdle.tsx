import { TransactionList } from '@/features/transaction-list';

export function TsansactionListIdle() {
  return <TransactionList isLoading={false} data={{ count: 0, list: [] }} />;
}
