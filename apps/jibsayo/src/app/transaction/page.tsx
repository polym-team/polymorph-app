import { TransactionsResponse } from '@/app/api/transactions/types';
import { TransactionList } from '@/features/transaction-list';
import { FavoriteRegionList, SearchForm } from '@/features/transaction-search';

import { Suspense } from 'react';

import { TsansactionListFetched } from './TsansactionListFetched';
import { TsansactionListIdle } from './TsansactionListIdle';
import { TsansactionListLoading } from './TsansactionListLoading';

async function fetchTransactionData(
  regionCode: string,
  tradeDate: string
): Promise<TransactionsResponse> {
  try {
    const response = await fetch(
      `http://localhost:3000/api/transactions?area=${regionCode}&createDt=${tradeDate}`,
      { cache: 'no-store' }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    return { count: 0, list: [] };
  }
}

// 데이터를 가져오는 컴포넌트 (로딩 완료 후)
async function TransactionDataComponent({
  regionCode,
  tradeDate,
}: {
  regionCode: string;
  tradeDate: string;
}) {
  const data = await fetchTransactionData(regionCode, tradeDate);
  return <TransactionList isLoading={false} data={data} />;
}

// 로딩 중 컴포넌트
function TransactionLoadingComponent() {
  return <TransactionList isLoading={true} data={{ count: 0, list: [] }} />;
}

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
