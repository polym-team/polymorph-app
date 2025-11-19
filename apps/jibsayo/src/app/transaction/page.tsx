import { TransactionList } from '@/features/transaction-list';
import { TransactionSearch } from '@/features/transaction-search';

import { Suspense } from 'react';

import { QueryParamProvider } from './QueryParamProvider';

export default async function TransactionPage() {
  return (
    <QueryParamProvider>
      <div className="flex flex-col">
        <Suspense fallback={null}>
          <TransactionSearch />
        </Suspense>
        <Suspense fallback={null}>
          <TransactionList />
        </Suspense>
      </div>
    </QueryParamProvider>
  );
}
