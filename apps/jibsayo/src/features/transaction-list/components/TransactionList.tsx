'use client';

import { useFavoriteApartList } from '@/entities/apart';
import {
  getCityNameWithRegionCode,
  getRegionNameWithRegionCode,
} from '@/entities/region';
import {
  useSearchParams,
  useTransactionListQuery,
} from '@/entities/transaction';

import { useMemo, useRef } from 'react';

import { useTransactionFilter } from '../hooks/useTransactionFilter';
import { useTransactionViewSetting } from '../hooks/useTransactionViewSetting';
import { TransactionItem } from '../models/types';
import { calculateAveragePricePerPyeong } from '../services/calculator';
import { mapTransactionsWithFavorites } from '../services/mapper';
import { TransactionListHeader } from '../ui/TransactionListHeader';
import { TransactionListTable } from '../ui/TransactionListTable';

export function TransactionList() {
  const { searchParams } = useSearchParams();
  const { isLoading, isFetched, data } = useTransactionListQuery();

  const { favoriteApartList, addFavoriteApart, removeFavoriteApart } =
    useFavoriteApartList();

  const {
    sorting,
    pageSize,
    pageIndex,
    updateSorting,
    updatePageSize,
    updatePageIndex,
  } = useTransactionViewSetting();

  const { filter, setFilter } = useTransactionFilter();

  // 즐겨찾기 토글 중인지 추적
  const isTogglingFavorite = useRef(false);

  const filteredTransactions = useMemo(() => {
    return mapTransactionsWithFavorites({
      transactions: data?.list ?? [],
      favoriteApartList,
      filter,
      regionCode: searchParams.regionCode,
    });
  }, [data?.list, favoriteApartList, filter, searchParams.regionCode]);

  const totalCount = filteredTransactions.length;
  const averagePricePerPyeong =
    calculateAveragePricePerPyeong(filteredTransactions);

  const cityName = searchParams.regionCode
    ? getCityNameWithRegionCode(searchParams.regionCode)
    : '';
  const regionName = searchParams.regionCode
    ? getRegionNameWithRegionCode(searchParams.regionCode)
    : '';
  const fullRegionName =
    cityName && regionName ? `${cityName} ${regionName}` : '';

  const handleToggleFavorite = (item: TransactionItem) => {
    if (!searchParams.regionCode) return;

    // 즐겨찾기 토글 시작
    isTogglingFavorite.current = true;

    if (item.favorite) {
      removeFavoriteApart(searchParams.regionCode, item);
    } else {
      const apartItem = {
        apartId: item.apartId,
        apartName: item.apartName,
      };
      addFavoriteApart(searchParams.regionCode, apartItem);
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
        filter={filter}
        setFilter={setFilter}
      />
      <TransactionListTable
        isLoading={isLoading}
        isFetched={isFetched}
        data={filteredTransactions}
        sorting={sorting}
        pageSize={pageSize}
        pageIndex={pageIndex}
        onToggleFavorite={handleToggleFavorite}
        onSortingChange={updateSorting}
        onPageSizeChange={updatePageSize}
        onPageIndexChange={updatePageIndex}
        preservePageIndex={isTogglingFavorite.current}
      />
    </div>
  );
}
