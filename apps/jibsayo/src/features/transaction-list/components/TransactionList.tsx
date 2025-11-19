'use client';

import { useTransactionListQuery } from '@/entities/transaction';

import { useTransactionData } from '../hooks/useTransactionData';
import { useTransactionEvent } from '../hooks/useTransactionEvent';
import { useTransactionSummary } from '../hooks/useTransactionSummary';
import { useTransactionViewSetting } from '../hooks/useTransactionViewSetting';
import { Summary } from '../ui/Summary';
import { TransactionCardList } from '../ui/TransactionCardList';
import { TransactionSorting } from '../ui/TransactionSorting';

export function TransactionList() {
  const { isLoading, data } = useTransactionListQuery();
  const transactionListData = data?.list ?? [];

  const { pageIndex, sorting, updateSorting, updatePageIndex } =
    useTransactionViewSetting();
  const { transactionData, transactionTotalCount, transactionAverageAmount } =
    useTransactionData({
      transactionListData,
      pageIndex,
      sorting,
    });
  const { cityName, regionName } = useTransactionSummary();
  const { toggleFavorite, navigateToApartDetail } = useTransactionEvent();

  return (
    <div className="flex flex-col gap-y-2 p-3 pb-10">
      <div className="flex items-center justify-between">
        <Summary
          isLoading={isLoading}
          cityName={cityName}
          regionName={regionName}
          transactionTotalCount={transactionTotalCount}
          transactionAverageAmount={transactionAverageAmount}
        />
        <TransactionSorting sorting={sorting} onSortingChange={updateSorting} />
      </div>
      <TransactionCardList
        items={transactionData}
        totalItems={transactionTotalCount}
        pageIndex={pageIndex}
        onFavoriteToggle={toggleFavorite}
        onPageIndexChange={updatePageIndex}
        onRowClick={navigateToApartDetail}
      />
    </div>
  );
}
