import { TransactionList } from '@/features/transaction-list/components/TransactionList';
import { TransactionSearch } from '@/features/transaction-search';

import { Suspense } from 'react';

import { QueryParamsInitializer } from './QueryParamsInitializer';

export default async function TransactionsPage() {
  return (
    <div className="flex flex-col gap-y-5">
      {/* 페이지 로드 시 세션 스토리지에서 쿼리 파라미터 복원 */}
      <QueryParamsInitializer />
      <Suspense fallback={null}>
        <TransactionSearch />
        <TransactionList />
      </Suspense>
    </div>
  );
}
