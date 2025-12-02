'use client';

import { ApartDetailResponse } from '@/app/api/apart/types';
import { PageContainer } from '@/shared/ui/PageContainer';

import { useApartTransactionList } from './hooks/useApartTransactionList';
import { SelectedMonthProvider } from './SelectedMonthContext';
import { TransactionChart } from './sub-features/transaction-chart/TransactionChart';
import { TransactionList } from './sub-features/transaction-list/TransactionList';
import { TransactionFilter } from './TransactionFilter';

interface ApartTransactionHistoryProps {
  data: ApartDetailResponse;
}

export function ApartTransactionList({ data }: ApartTransactionHistoryProps) {
  const {
    allSizes,
    selectedPeriod,
    selectedSizes,
    filteredTradeItems,
    changePeriod,
    changeSizes,
  } = useApartTransactionList({ data });

  return (
    <SelectedMonthProvider>
      <PageContainer bgColor="white" className="pb-10 pt-6">
        <span className="font-semibold lg:text-lg">거래 내역</span>
        <div className="mt-2 flex flex-col gap-y-5">
          <TransactionFilter
            allSizes={allSizes}
            selectedPeriod={selectedPeriod}
            selectedSizes={selectedSizes}
            onChangePeriod={changePeriod}
            onChangeSizes={changeSizes}
          />
          <TransactionChart
            allSizes={allSizes}
            tradeItems={filteredTradeItems}
          />
          <TransactionList
            apartName={data.apartName}
            regionCode={data.regionCode}
            tradeItems={filteredTradeItems}
          />
        </div>
      </PageContainer>
    </SelectedMonthProvider>
  );
}
