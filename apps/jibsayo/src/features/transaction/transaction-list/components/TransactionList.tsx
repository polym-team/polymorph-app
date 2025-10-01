'use client';

import { useTransactionFilter } from '../hooks/useTransactionFilter';
import { useTransactionSummary } from '../hooks/useTransactionSummary';
import { useTransactionViewSetting } from '../hooks/useTransactionViewSetting';
import { TransactionFilter } from '../ui/TransactionFilter';
import { TransactionSummary } from '../ui/TransactionSummary';
import { TransactionListData } from './TransactionListData';

export function TransactionList() {
  const {
    cityName,
    regionName,
    transactionTotalCount,
    transactionAverageAmount,
  } = useTransactionSummary();
  const { filter, selectedFilter, changeFilter, submitFilter, resetFilter } =
    useTransactionFilter();
  const { pageIndex, sorting, updateSorting, updatePageIndex } =
    useTransactionViewSetting();

  return (
    <div className="flex flex-col gap-y-3">
      <TransactionSummary
        cityName={cityName}
        regionName={regionName}
        transactionTotalCount={transactionTotalCount}
        transactionAverageAmount={transactionAverageAmount}
      />
      <TransactionFilter
        filter={filter}
        selectedFilter={selectedFilter}
        onChangeFilter={changeFilter}
        onSubmitFilter={submitFilter}
        onResetFilter={resetFilter}
      />
      <TransactionListData
        pageIndex={pageIndex}
        sorting={sorting}
        onSortingChange={updateSorting}
        onPageIndexChange={updatePageIndex}
      />
    </div>
  );
}
