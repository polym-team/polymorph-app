'use client';

import { ApartDetailResponse } from '@/app/api/apart/types';

import { useState } from 'react';

import { SortingState } from '@package/ui';

import { useTransactionHistoryTableData } from '../hooks/useTransactionHistoryTableData';
import { mapTradeItemsWithPriceChangeRate } from '../services/mapper';
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
    <ApartTransactionHistoryTable
      sorting={sorting}
      tradeItems={mappedTradeItems}
      onChangeSorting={changeSorting}
    />
  );
}
