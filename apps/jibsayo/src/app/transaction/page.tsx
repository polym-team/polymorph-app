import { FavoriteRegionList, SearchForm } from '@/features/transaction-search';

import { Suspense } from 'react';

import { TsansactionListFetched } from './TsansactionListFetched';
import { TsansactionListIdle } from './TsansactionListIdle';
import { TsansactionListLoading } from './TsansactionListLoading';

interface PageProps {
  searchParams: {
    regionCode?: string;
    tradeDate?: string;
  };
}

export default function TransactionPage({ searchParams }: PageProps) {
  const { regionCode, tradeDate } = searchParams;
  const hasParams = !!regionCode && !!tradeDate;

  return (
    <section>
      <div className="flex flex-col gap-y-2">
        <SearchForm />
        <FavoriteRegionList />
        {hasParams && (
          <Suspense fallback={<TsansactionListLoading />}>
            <TsansactionListFetched
              regionCode={regionCode}
              tradeDate={tradeDate}
            />
          </Suspense>
        )}
        {!hasParams && <TsansactionListIdle />}
      </div>
    </section>
  );
}
