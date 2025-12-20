'use client';

import { useTransactionList } from './hooks/useTransactionList';
import { TransactionListContent } from './sub-features/transaction-list-content/TransactionListContent';
import { TransactionListHeader } from './sub-features/transaction-list-header/TransactionListHeader';
import { EmptyContent } from './ui/EmptyContent';
import { NotSearchedContent } from './ui/NotSearchedContent';

export function TransactionList() {
  const { sorting, pageIndex, transaction, handlers } = useTransactionList();

  if (transaction.fetchStatus === 'NOT_SEARCHED') {
    return <NotSearchedContent />;
  }

  if (transaction.fetchStatus === 'EMPTY') {
    return <EmptyContent />;
  }

  return (
    <div className="flex flex-col gap-y-2">
      <TransactionListHeader transaction={transaction} sorting={sorting} />
      <TransactionListContent
        sorting={sorting}
        pageIndex={pageIndex}
        transaction={transaction}
        handlers={handlers}
      />
    </div>
  );
}
