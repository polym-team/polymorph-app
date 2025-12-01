'use client';

import { PageContainer } from '@/shared/ui/PageContainer';

import { useTransactionList } from './hooks/useTransactionList';
import { TransactionListContent } from './sub-features/transaction-list-content/TransactionListContent';
import { TransactionListHeader } from './sub-features/transaction-list-header/TransactionListHeader';
import { EmptyContent } from './ui/EmptyContent';
import { NotSearchedContent } from './ui/NotSearchedContent';

export function TransactionList() {
  const {
    sorting,
    summary,
    pageIndex,
    transactionStatus,
    transactionItems,
    toggleFavorite,
    navigateToApartDetail,
  } = useTransactionList();

  if (transactionStatus === 'NOT_SEARCHED') {
    return <NotSearchedContent />;
  }

  if (transactionStatus === 'EMPTY') {
    return <EmptyContent />;
  }

  return (
    <PageContainer className="pb-10 pt-5 lg:pt-2">
      <div className="flex flex-col gap-y-2">
        <TransactionListHeader
          isLoading={transactionStatus === 'LOADING'}
          sorting={sorting}
          summary={summary}
        />
        <TransactionListContent
          isLoading={transactionStatus === 'LOADING'}
          sorting={sorting}
          summary={summary}
          pageIndex={pageIndex}
          items={transactionItems}
          onFavoriteToggle={toggleFavorite}
          onRowClick={navigateToApartDetail}
        />
      </div>
    </PageContainer>
  );
}
