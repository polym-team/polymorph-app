'use client';

import { useTransactionViewSetting } from '../hooks/useTransactionViewSetting';
import { TransactionListData } from './TransactionListData';
import { TransactionListHeader } from './TransactionListHeader';

export function TransactionList() {
  const { pageIndex, sorting, updateSorting, updatePageIndex } =
    useTransactionViewSetting();

  return (
    <div className="flex flex-col gap-y-3">
      <TransactionListHeader />
      <TransactionListData
        pageIndex={pageIndex}
        sorting={sorting}
        onSortingChange={updateSorting}
        onPageIndexChange={updatePageIndex}
      />
    </div>
  );
}
