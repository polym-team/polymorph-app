import { TransactionList } from '@/features/transaction-list';
import { TransactionSearch } from '@/features/transaction-search';

import { Suspense } from 'react';

export default function TransactionsPage() {
  return (
    <main className="container mx-auto py-8">
      <section className="flex flex-col gap-y-8">
        <div className="flex flex-col gap-y-5">
          <Suspense fallback={<div>Loading...</div>}>
            <TransactionSearch />
          </Suspense>
          <Suspense fallback={<div>Loading...</div>}>
            <TransactionList />
          </Suspense>
        </div>
      </section>
    </main>
  );
}
