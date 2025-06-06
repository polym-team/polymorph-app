import { TransactionList } from '@/features/transaction-list/components/TransactionList';
import { TransactionSearch } from '@/features/transaction-search';

import { Suspense } from 'react';

import { getTransactions } from './service';

interface Props {
  searchParams: {
    regionCode?: string;
    tradeDate?: string;
  };
}

export default async function TransactionsPage({ searchParams }: Props) {
  const { regionCode, tradeDate } = searchParams;

  return (
    <main className="container mx-auto py-8">
      <div className="flex flex-col gap-y-5">
        <TransactionSearch />

        <Suspense
          fallback={
            <TransactionList
              regionCode={regionCode}
              data={{ list: [], count: 0 }}
              isLoading={true}
              isFetched={false}
            />
          }
        >
          <div>
            regionCode: {regionCode} / tradeDate: {tradeDate}
          </div>
          {regionCode && tradeDate ? (
            <TransactionList
              regionCode={regionCode}
              data={
                (await getTransactions(regionCode, tradeDate)) || {
                  list: [],
                  count: 0,
                }
              }
              isLoading={false}
              isFetched={true}
            />
          ) : (
            <TransactionList
              regionCode={regionCode}
              data={{ list: [], count: 0 }}
              isLoading={false}
              isFetched={false}
            />
          )}
        </Suspense>
      </div>
    </main>
  );
}
