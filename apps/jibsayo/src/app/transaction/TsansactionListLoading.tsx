import { TransactionList } from '@/features/transaction-list';

export function TsansactionListLoading() {
  return <TransactionList isLoading={true} data={{ count: 0, list: [] }} />;
}
