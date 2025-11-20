import { TransactionList } from '@/features/transaction-list';
import { TransactionSearch } from '@/features/transaction-search';
import { PageLayout } from '@/wigets/ui/PageLayout';

import { Suspense } from 'react';

import { QueryParamProvider } from './QueryParamProvider';

export default async function TransactionPage() {
  return (
    <QueryParamProvider>
      <PageLayout bgColor="gray">
        <Suspense fallback={null}>
          <TransactionSearch />
        </Suspense>
        <Suspense fallback={null}>
          <TransactionList />
        </Suspense>
      </PageLayout>
    </QueryParamProvider>
  );
}
