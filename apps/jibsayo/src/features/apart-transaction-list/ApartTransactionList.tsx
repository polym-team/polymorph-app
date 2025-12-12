'use client';

import { PageContainer } from '@/shared/ui/PageContainer';

import { useApartTransactionList } from './hooks/useApartTransactionList';
import { TransactionList } from './sub-features/transaction-list/TransactionList';
import { TransactionFilter } from './ui/TransactionFilter';

interface ApartTransactionListProps {
  apartId: number | null;
}

export function ApartTransactionList({ apartId }: ApartTransactionListProps) {
  const { allSizes, selectedPeriod, selectedSizes, changePeriod, changeSizes } =
    useApartTransactionList();

  return (
    <PageContainer bgColor="white" className="pb-12 pt-4 lg:pt-6">
      <span className="text-sm text-gray-500 lg:text-base">거래 내역</span>
      <div className="mt-2 flex flex-col gap-y-5">
        <TransactionFilter
          allSizes={allSizes}
          selectedPeriod={selectedPeriod}
          selectedSizes={selectedSizes}
          onChangePeriod={changePeriod}
          onChangeSizes={changeSizes}
        />
        {/* <TransactionChart
          allSizes={allSizes}
          transactionItems={filteredTransactionItems}
        /> */}
        <TransactionList apartId={apartId} selectedPeriod={selectedPeriod} />
      </div>
    </PageContainer>
  );
}
