'use client';

import { useFavoriteApartList } from '@/entities/apart';
import {
  getCityNameWithRegionCode,
  getRegionNameWithRegionCode,
} from '@/entities/region';

import { Search } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';

import { Card, Typography } from '@package/ui';

import { useTransactionFilter } from '../hooks/useTransactionFilter';
import { useTransactionViewSetting } from '../hooks/useTransactionViewSetting';
import { TransactionItem } from '../models/types';
import { useTransactionListQuery } from '../models/useTransactionListQuery';
import { calculateAveragePricePerPyeong } from '../services/calculator';
import { mapTransactionsWithFavorites } from '../services/mapper';
import { TransactionListHeader } from '../ui/TransactionListHeader';
import { TransactionListTable } from '../ui/TransactionListTable';

export function TransactionList() {
  const { isLoading, isFetched, data } = useTransactionListQuery();
  const searchParams = useSearchParams();
  const regionCode = searchParams.get('regionCode') ?? undefined;
  const transactions = data?.list ?? [];

  const { favoriteApartList, addFavoriteApart, removeFavoriteApart } =
    useFavoriteApartList();

  const { sorting, pageSize, updateSorting, updatePageSize } =
    useTransactionViewSetting();

  const {
    searchTerm,
    isNationalSizeOnly,
    isFavoriteOnly,
    setSearchTerm,
    setIsNationalSizeOnly,
    setIsFavoriteOnly,
  } = useTransactionFilter();

  const filteredTransactions = useMemo(() => {
    return mapTransactionsWithFavorites({
      transactions,
      searchTerm,
      isNationalSizeOnly,
      isFavoriteOnly,
      favoriteApartList,
      regionCode,
    });
  }, [
    transactions,
    searchTerm,
    isNationalSizeOnly,
    isFavoriteOnly,
    favoriteApartList,
    regionCode,
  ]);

  const totalCount = filteredTransactions.length;
  const averagePricePerPyeong =
    calculateAveragePricePerPyeong(filteredTransactions);

  const cityName = regionCode ? getCityNameWithRegionCode(regionCode) : '';
  const regionName = regionCode ? getRegionNameWithRegionCode(regionCode) : '';
  const fullRegionName =
    cityName && regionName ? `${cityName} ${regionName}` : '';

  const handleToggleFavorite = (item: TransactionItem) => {
    if (!regionCode) return;

    if (item.favorite) {
      removeFavoriteApart(regionCode, item.apartId);
    } else {
      const apartItem = {
        apartId: item.apartId,
        apartName: item.apartName,
      };
      addFavoriteApart(regionCode, apartItem);
    }
  };

  return (
    <div className="flex flex-col gap-y-2">
      <TransactionListHeader
        fullRegionName={fullRegionName}
        filteredTransactionsLength={filteredTransactions.length}
        totalCount={totalCount}
        averagePricePerPyeong={averagePricePerPyeong}
        isFavoriteOnly={isFavoriteOnly}
        isNationalSizeOnly={isNationalSizeOnly}
        searchTerm={searchTerm}
        onFavoriteOnlyChange={setIsFavoriteOnly}
        onNationalSizeOnlyChange={setIsNationalSizeOnly}
        onSearchTermChange={setSearchTerm}
      />
      <TransactionListTable
        isLoading={isLoading}
        isFetched={isFetched}
        data={filteredTransactions}
        sorting={sorting}
        pageSize={pageSize}
        onToggleFavorite={handleToggleFavorite}
        onSortingChange={updateSorting}
        onPageSizeChange={updatePageSize}
      />
    </div>
  );
}
