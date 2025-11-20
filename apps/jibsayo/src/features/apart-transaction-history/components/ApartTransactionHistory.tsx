'use client';

import { ApartDetailResponse } from '@/app/api/apart/models/types';
import { BoxContainer } from '@/shared/ui/BoxContainer';

import { SelectedMonthProvider } from '../contexts/SelectedMonthContext';
import { useTransactionHistoryFilter } from '../hooks/useTransactionHistoryFilter';
import { calculateSizes } from '../services/calculator';
import { filterTradeItems } from '../services/filter';
import { ApartTransactionHistoryFilter } from '../ui/ApartTransactionHistoryFilter';

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
    <SelectedMonthProvider>
      <BoxContainer bgColor="white">
        <span className="font-semibold">거래 내역</span>
        <div className="mt-2 flex flex-col gap-y-5">
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
        </div>
      </BoxContainer>
    </SelectedMonthProvider>
  );
}
