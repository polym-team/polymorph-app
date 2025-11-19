import { TransactionList } from '@/features/transaction-list';
import { TransactionSearch } from '@/features/transaction-search';
import { ROUTE_PATH_LABEL } from '@/shared/consts/route';
import { PageLayout } from '@/shared/ui/PageLayout';

import { Suspense } from 'react';

import { QueryParamProvider } from './QueryParamProvider';

export default async function TransactionPage() {
  return (
    <QueryParamProvider>
      <PageLayout title={ROUTE_PATH_LABEL.TRANSACTION}>
        <div className="flex flex-col">
          <Suspense fallback={null}>
            <TransactionSearch />
          </Suspense>
          <Suspense fallback={null}>
            <TransactionList />
          </Suspense>
        </div>
      </PageLayout>
    </QueryParamProvider>
  );
}
