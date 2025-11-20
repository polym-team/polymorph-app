'use client';

import { useTransactionListQuery } from '@/entities/transaction';
import { BoxContainer } from '@/shared/ui/BoxContainer';

import { useTransactionData } from '../hooks/useTransactionData';
import { useTransactionEvent } from '../hooks/useTransactionEvent';
import { useTransactionSummary } from '../hooks/useTransactionSummary';
import { useTransactionViewSetting } from '../hooks/useTransactionViewSetting';
import { Summary } from '../ui/Summary';
import { SummarySkeleton } from '../ui/SummarySkeleton';
import { TransactionCardList } from '../ui/TransactionCardList';
import { TransactionCardListSkeleton } from '../ui/TransactionCardListSkeleton';
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

  if (!isLoading && data === undefined) {
    return (
      <div className="py-10 text-center text-sm text-gray-500">
        원하는 정보를 선택한 후 검색해주세요
      </div>
    );
  }

  if (!isLoading && transactionTotalCount === 0) {
    return (
      <div className="py-10 text-center text-sm text-gray-500">
        조건에 맞는 데이터가 없어요
      </div>
    );
  }

  return (
    <BoxContainer>
      <div className="flex flex-col gap-y-2 pb-10">
        <div className="flex items-center justify-between">
          {isLoading ? (
            <SummarySkeleton />
          ) : (
            <Summary
              cityName={cityName}
              regionName={regionName}
              transactionTotalCount={transactionTotalCount}
              transactionAverageAmount={transactionAverageAmount}
            />
          )}
          <TransactionSorting
            sorting={sorting}
            onSortingChange={updateSorting}
          />
        </div>
        {isLoading ? (
          <TransactionCardListSkeleton />
        ) : (
          <TransactionCardList
            items={transactionData}
            totalItems={transactionTotalCount}
            pageIndex={pageIndex}
            onFavoriteToggle={toggleFavorite}
            onPageIndexChange={updatePageIndex}
            onRowClick={navigateToApartDetail}
          />
        )}
      </div>
    </BoxContainer>
  );
}
