import { TransactionList } from '@/features/transaction-list';
import { TransactionSearch } from '@/features/transaction-search';
import { PageLayout } from '@/widgets/ui/page-layout/PageLayout';

import { Suspense } from 'react';

import { QueryParamProvider } from './QueryParamProvider';
import { WebviewInitializer } from './WebviewInitializer';

export default async function TransactionsPage() {
  return (
    <QueryParamProvider>
      <PageLayout bgColor="gray">
        <WebviewInitializer />
        <Suspense fallback={null}>
          <TransactionSearch />
          <TransactionList />
        </Suspense>
      </PageLayout>
    </QueryParamProvider>
  );
}
