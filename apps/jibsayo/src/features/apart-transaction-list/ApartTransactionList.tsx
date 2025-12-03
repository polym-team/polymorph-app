'use client';

import { PageContainer } from '@/shared/ui/PageContainer';

import { ApartInfoType } from '../apart-info/type';
import { useApartTransactionList } from './hooks/useApartTransactionList';
import { SelectedMonthProvider } from './SelectedMonthContext';
import { TransactionChart } from './sub-features/transaction-chart/TransactionChart';
import { TransactionList } from './sub-features/transaction-list/TransactionList';
import { TransactionFilter } from './TransactionFilter';

interface ApartTransactionListProps {
  apartToken: string;
  data: ApartInfoType;
}

export function ApartTransactionList({
  apartToken,
  data,
}: ApartTransactionListProps) {
  const {
    allSizes,
    selectedPeriod,
    selectedSizes,
    filteredTransactionItems,
    changePeriod,
    changeSizes,
  } = useApartTransactionList({ apartToken });

  if (filteredTransactionItems.length === 0) {
    return null;
  }

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
            transactionItems={filteredTransactionItems}
          />
          <TransactionList
            apartName={data.apartName}
            regionCode={data.regionCode}
            transactionItems={filteredTransactionItems}
          />
        </div>
      </PageContainer>
    </SelectedMonthProvider>
  );
}
