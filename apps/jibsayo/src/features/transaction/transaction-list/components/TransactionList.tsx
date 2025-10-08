'use client';

import { useTransactionFilter } from '../hooks/useTransactionFilter';
import { TransactionFilter } from '../ui/TransactionFilter';
import { TransactionListData } from './TransactionListData';
import { TransactionSummary } from './TransactionSummary';

export function TransactionList() {
  const { filter, selectedFilter, changeFilter, submitFilter, resetFilter } =
    useTransactionFilter();

  return (
    <div className="flex flex-col gap-y-3">
      <TransactionSummary />
      <TransactionFilter
        filter={filter}
        selectedFilter={selectedFilter}
        onChangeFilter={changeFilter}
        onSubmitFilter={submitFilter}
        onResetFilter={resetFilter}
      />
      <TransactionListData />
    </div>
  );
}
