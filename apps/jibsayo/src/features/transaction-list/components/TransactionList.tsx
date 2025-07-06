'use client';

import { useFavoriteApartList } from '@/entities/apart';
import {
  getCityNameWithRegionCode,
  getRegionNameWithRegionCode,
} from '@/entities/region';
import {
  useNewTransactionListQuery,
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

  // 신규 거래건 조회 (일별 신규 거래)
  const { data: newTransactionData, isLoading: isNewTransactionLoading } =
    useNewTransactionListQuery({
      area: searchParams.regionCode,
    });

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

  // 신규 거래건 판단 (오늘 등록된 거래의 개별 거래건 ID 기준)
  const newTransactionIds = useMemo(() => {
    const newTransactions = newTransactionData?.list ?? [];
    return new Set(
      newTransactions.map(
        (transaction: any) => transaction.id || transaction.apartId
      )
    );
  }, [newTransactionData?.list]);

  const filteredTransactions = useMemo(() => {
    return mapTransactionsWithFavorites({
      transactions: data?.list ?? [],
      favoriteApartList,
      filter,
      regionCode: searchParams.regionCode,
      newTransactionKeys: newTransactionIds,
    });
  }, [
    data?.list,
    favoriteApartList,
    filter,
    searchParams.regionCode,
    newTransactionIds,
  ]);

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
        apartName: item.apartName,
        address: item.address,
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
        isLoading={isLoading || isNewTransactionLoading}
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
        newTransactionIds={newTransactionIds}
        regionCode={searchParams.regionCode}
      />
    </div>
  );
}
