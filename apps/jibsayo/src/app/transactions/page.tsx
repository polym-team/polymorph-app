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
    <div className="flex flex-col gap-y-5">
      <TransactionSearch />
      {regionCode && tradeDate ? (
        <Suspense
          key={`${regionCode}-${tradeDate}`}
          fallback={
            <TransactionList
              regionCode={regionCode}
              data={{ list: [], count: 0 }}
              isLoading={true}
              isFetched={false}
            />
          }
        >
          {(async () => {
            const data = await getTransactions(regionCode, tradeDate);
            return (
              <TransactionList
                regionCode={regionCode}
                data={data || { list: [], count: 0 }}
                isLoading={false}
                isFetched={true}
              />
            );
          })()}
        </Suspense>
      ) : (
        <TransactionList
          regionCode={regionCode}
          data={{ list: [], count: 0 }}
          isLoading={false}
          isFetched={false}
        />
      )}
    </div>
  );
}
