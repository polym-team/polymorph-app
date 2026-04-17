'use client';

import { PageContainer } from '@/shared/ui/PageContainer';

import dynamic from 'next/dynamic';

import { ApartInfoType } from '../apart-info';
import { useApartTransactionList } from './hooks/useApartTransactionList';
import { TransactionList } from './sub-features/transaction-list/TransactionList';

const TransactionChart = dynamic(
  () =>
    import('./sub-features/transaction-chart/TransactionChart').then(
      mod => mod.TransactionChart
    ),
  { ssr: false }
);
import { TransactionFilter } from './ui/TransactionFilter';

interface ApartTransactionListProps {
  apartId: number;
  data?: ApartInfoType;
}

export function ApartTransactionList({
  apartId,
  data,
}: ApartTransactionListProps) {
  const { allSizes, selectedPeriod, selectedSizes, changePeriod, changeSizes } =
    useApartTransactionList({ data });

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
        <TransactionChart
          apartId={apartId}
          allSizes={allSizes}
          selectedSizes={selectedSizes}
          selectedPeriod={selectedPeriod}
        />
        <TransactionList
          apartId={apartId}
          allSizes={allSizes}
          selectedSizes={selectedSizes}
          selectedPeriod={selectedPeriod}
        />
      </div>
    </PageContainer>
  );
}
