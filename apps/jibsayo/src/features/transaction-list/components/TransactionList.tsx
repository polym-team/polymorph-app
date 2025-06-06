'use client';

import { TransactionsResponse } from '@/app/api/transactions/types';
import { useFavoriteApartList } from '@/entities/apart';
import {
  getCityNameWithRegionCode,
  getRegionNameWithRegionCode,
} from '@/entities/region';

import { useMemo, useRef } from 'react';

import { useTransactionFilter } from '../hooks/useTransactionFilter';
import { useTransactionViewSetting } from '../hooks/useTransactionViewSetting';
import { TransactionItem } from '../models/types';
import { calculateAveragePricePerPyeong } from '../services/calculator';
import { mapTransactionsWithFavorites } from '../services/mapper';
import { TransactionListHeader } from '../ui/TransactionListHeader';
import { TransactionListTable } from '../ui/TransactionListTable';

interface Props {
  regionCode: string;
  data: TransactionsResponse;
}

export function TransactionList({ regionCode, data }: Props) {
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

  // 즐겨찾기 토글 중인지 추적
  const isTogglingFavorite = useRef(false);

  const filteredTransactions = useMemo(() => {
    return mapTransactionsWithFavorites({
      transactions: data.list,
      searchTerm,
      isNationalSizeOnly,
      isFavoriteOnly,
      favoriteApartList,
      regionCode,
    });
  }, [
    data.list,
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

    // 즐겨찾기 토글 시작
    isTogglingFavorite.current = true;

    if (item.favorite) {
      removeFavoriteApart(regionCode, item.apartId);
    } else {
      const apartItem = {
        apartId: item.apartId,
        apartName: item.apartName,
      };
      addFavoriteApart(regionCode, apartItem);
    }

    // 다음 렌더링 후 플래그 리셋
    setTimeout(() => {
      isTogglingFavorite.current = false;
    }, 0);
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
        isLoading={false}
        isFetched={false}
        data={filteredTransactions}
        sorting={sorting}
        pageSize={pageSize}
        onToggleFavorite={handleToggleFavorite}
        onSortingChange={updateSorting}
        onPageSizeChange={updatePageSize}
        preservePageIndex={isTogglingFavorite.current}
      />
    </div>
  );
}
