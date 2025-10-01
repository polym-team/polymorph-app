'use client';

import { useTransactionSummary } from '../hooks/useTransactionSummary';
import { useTransactionViewSetting } from '../hooks/useTransactionViewSetting';
import { TransactionSummary } from '../ui/TransactionSummary';
import { TransactionListData } from './TransactionListData';

export function TransactionList() {
  const {
    cityName,
    regionName,
    transactionTotalCount,
    transactionAverageAmount,
  } = useTransactionSummary();
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
      {/* <TransactionListHeader /> */}
      <TransactionListData
        pageIndex={pageIndex}
        sorting={sorting}
        onSortingChange={updateSorting}
        onPageIndexChange={updatePageIndex}
      />
    </div>
  );
}
