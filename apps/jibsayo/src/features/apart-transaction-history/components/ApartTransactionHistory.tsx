'use client';

import { ApartDetailResponse } from '@/app/api/apart/types';

import { useTransactionHistoryTableData } from '../hooks/useTransactionHistoryTableData';
import { ApartTransactionHistoryChart } from '../ui/ApartTransactionHistoryChart';
import { ApartTransactionHistoryLayout } from '../ui/ApartTransactionHistoryLayout';
import { ApartTransactionHistoryTable } from '../ui/ApartTransactionHistoryTable';

interface ApartTransactionHistoryProps {
  tradeItems: ApartDetailResponse['tradeItems'];
}

export function ApartTransactionHistory({
  tradeItems,
}: ApartTransactionHistoryProps) {
  const { sorting, mappedTradeItems, changeSorting } =
    useTransactionHistoryTableData(tradeItems);

  return (
    <ApartTransactionHistoryLayout>
      <ApartTransactionHistoryChart tradeItems={tradeItems} />
      <ApartTransactionHistoryTable
        sorting={sorting}
        tradeItems={mappedTradeItems}
        onChangeSorting={changeSorting}
      />
    </ApartTransactionHistoryLayout>
  );
}
