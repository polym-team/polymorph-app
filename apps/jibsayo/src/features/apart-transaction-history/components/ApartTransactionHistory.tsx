'use client';

import { ApartDetailResponse } from '@/app/api/apart/types';

import { useState } from 'react';

import { SortingState } from '@package/ui';

import { ApartTransactionHistoryTable } from '../ui/ApartTransactionHistoryTable';

interface ApartTransactionHistoryProps {
  tradeItems: ApartDetailResponse['tradeItems'];
}

export function ApartTransactionHistory({
  tradeItems,
}: ApartTransactionHistoryProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'tradeDate', desc: true },
  ]);

  const changeSorting = (newSorting: SortingState) => {
    setSorting(newSorting);
  };

  return (
    <ApartTransactionHistoryTable
      sorting={sorting}
      tradeItems={tradeItems}
      onChangeSorting={changeSorting}
    />
  );
}
