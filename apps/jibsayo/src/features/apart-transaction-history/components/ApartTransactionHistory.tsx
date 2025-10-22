'use client';

import { ApartDetailResponse } from '@/app/api/apart/types';

import { useTransactionHistoryFilter } from '../hooks/useTransactionHistoryFilter';
import { calculateSizes } from '../services/calculator';
import { filterTradeItems } from '../services/filter';
import { ApartTransactionHistoryFilter } from '../ui/ApartTransactionHistoryFilter';
import { ApartTransactionHistoryLayout } from '../ui/ApartTransactionHistoryLayout';
import { ApartTransactionHistoryChart } from './ApartTransactionHistoryChart';
import { ApartTransactionHistoryTable } from './ApartTransactionHistoryTable';

interface ApartTransactionHistoryProps {
  data: ApartDetailResponse;
}

export function ApartTransactionHistory({
  data,
}: ApartTransactionHistoryProps) {
  const { tradeItems, apartName, regionCode } = data;

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
        allSizes={sizes}
        selectedPeriod={selectedPeriod}
        selectedSizes={selectedSizes}
        onChangePeriod={changePeriod}
        onChangeSizes={changeSizes}
      />
      <ApartTransactionHistoryChart
        tradeItems={filteredTradeItems}
        allSizes={sizes}
      />
      <ApartTransactionHistoryTable
        apartName={apartName}
        regionCode={regionCode}
        tradeItems={filteredTradeItems}
      />
    </ApartTransactionHistoryLayout>
  );
}
