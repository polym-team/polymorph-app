'use client';

import { ApartDetailResponse } from '@/app/api/apart/types';

import { useTransactionHistoryFilter } from '../hooks/useTransactionHistoryFilter';
import { calculateSizes } from '../services/calculator';
import { filterTradeItems } from '../services/filter';
import { ApartTransactionHistoryChart } from '../ui/ApartTransactionHistoryChart';
import { ApartTransactionHistoryFilter } from '../ui/ApartTransactionHistoryFilter';
import { ApartTransactionHistoryLayout } from '../ui/ApartTransactionHistoryLayout';
import { ApartTransactionHistoryTable } from './ApartTransactionHistoryTable';

interface ApartTransactionHistoryProps {
  tradeItems: ApartDetailResponse['tradeItems'];
}

export function ApartTransactionHistory({
  tradeItems,
}: ApartTransactionHistoryProps) {
  const { selectedPeriod, selectedSizes, changePeriod, changeSizes } =
    useTransactionHistoryFilter(tradeItems);

  const sizes = calculateSizes(tradeItems);
  const filteredTradeItems = filterTradeItems(tradeItems, {
    selectedPeriod,
    selectedSizes,
  });

  return (
    <ApartTransactionHistoryLayout>
      <ApartTransactionHistoryFilter
        sizes={sizes}
        selectedPeriod={selectedPeriod}
        selectedSizes={selectedSizes}
        onChangePeriod={changePeriod}
        onChangeSizes={changeSizes}
      />
      <ApartTransactionHistoryChart tradeItems={filteredTradeItems} />
      <ApartTransactionHistoryTable tradeItems={filteredTradeItems} />
    </ApartTransactionHistoryLayout>
  );
}
