import { TransactionList } from '@/features/transaction-list';
import { TransactionSearch } from '@/features/transaction-search';

import { Suspense } from 'react';

import { QueryParamProvider } from './QueryParamProvider';

export default async function TransactionPage() {
  return (
    <Suspense fallback={null}>
      <QueryParamProvider>
        <div className="flex flex-col gap-y-5">
          <TransactionSearch />
          <TransactionList />
        </div>
      </QueryParamProvider>
    </Suspense>
  );
}
