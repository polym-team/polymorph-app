import { TransactionList } from '@/features/transaction-list/components/TransactionList';
import { TransactionSearch } from '@/features/transaction-search';

import { Suspense } from 'react';

export default async function TransactionsPage() {
  return (
    <div className="flex flex-col gap-y-5">
      <Suspense fallback={null}>
        <TransactionSearch />
        <TransactionList />
      </Suspense>
    </div>
  );
}
