import { calculateAreaPyeong } from '@/entities/transaction';
import { NewTransactionIcon } from '@/shared/ui/NewTransactionIcon';
import {
  formatDealDate,
  formatFloorText,
  formatKoreanAmountText,
  formatNumber,
  formatPyeongText,
  formatSizeText,
} from '@/shared/utils/formatter';

import { useMemo } from 'react';

import {
  ColumnDef,
  DataTable,
  DataTableColumnHeader,
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
  SortingState as OriginSortingState,
} from '@package/ui';

import { TRANSACTION_LIST_PAGE_SIZE } from '../../../consts';
import { Sorting, TransactionItemViewModel } from '../../../types';
import { FavoriteButton } from './FavoriteButton';
import { PriceLabel } from './PriceLabel';
import { PriceTooltip } from './PriceTooltip';

interface TableViewProps {
  isFetching: boolean;
  sorting: Sorting;
  pageIndex: number;
  totalCount: number;
  items: TransactionItemViewModel[];
  onSortingChange: (sorting: Sorting) => void;
  onPageIndexChange: (pageIndex: number) => void;
  onFavoriteToggle: (item: TransactionItemViewModel) => void;
  onRowClick: (item: TransactionItemViewModel) => void;
}

export function TableView({
  isFetching,
  sorting,
  pageIndex,
  totalCount,
  items,
  onSortingChange,
  onPageIndexChange,
  onFavoriteToggle,
  onRowClick,
}: TableViewProps) {
  const columns: ColumnDef<TransactionItemViewModel>[] = useMemo(
    () => [
      {
        size: 100,
        accessorKey: 'dealDate',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="거래일" />
        ),
        cell: ({ row }) => {
          if (isFetching) {
            return (
              <div className="py-2">
                <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
              </div>
            );
          }
          return (
            <div className="flex flex-col items-start gap-y-1">
              {row.original.isNewTransaction && (
                <span>
                  <NewTransactionIcon />
                </span>
              )}
              <span className="text-sm text-gray-600">
                {formatDealDate(row.original.dealDate)}
              </span>
            </div>
          );
        },
      },
      {
        size: 120,
        accessorKey: 'dong',
        enableSorting: true,
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="주소" />
        ),
        cell: ({ row }) => {
          if (isFetching) {
            return (
              <div className="py-2">
                <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
              </div>
            );
          }
          return (
            <span className="text-sm text-gray-600">
              {row.original.dong || '-'}
            </span>
          );
        },
      },
      {
        size: Infinity,
        accessorKey: 'apartName',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="아파트명" />
        ),
        cell: ({ row }) => {
          if (isFetching) {
            return (
              <div className="flex flex-col gap-y-3">
                <div className="h-5 w-32 animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
              </div>
            );
          }
          return (
            <div className="flex flex-col gap-y-1 pr-5">
              <div className="flex items-center gap-x-2">
                <span className="min-w-0 truncate font-semibold">
                  {row.original.apartName}
                </span>
                <FavoriteButton
                  active={row.original.isFavorite}
                  onClick={() => onFavoriteToggle(row.original)}
                />
              </div>
              {row.original.householdCount || row.original.completionYear ? (
                <span className="-translate-y-[1px] text-sm text-gray-500">
                  {!!row.original.householdCount &&
                    `${formatNumber(row.original.householdCount)}세대`}
                  {!!row.original.householdCount &&
                    !!row.original.completionYear &&
                    ' · '}
                  {!!row.original.completionYear &&
                    `${row.original.completionYear}년식`}
                </span>
              ) : null}
            </div>
          );
        },
      },
      {
        size: 100,
        accessorKey: 'floor',
        enableSorting: true,
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="층" />
        ),
        cell: ({ row }) => {
          if (isFetching) {
            return (
              <div className="py-2">
                <div className="h-4 w-12 animate-pulse rounded bg-gray-200" />
              </div>
            );
          }
          return (
            <span className="text-gray-600">
              {row.original.floor ? formatFloorText(row.original.floor) : ''}
            </span>
          );
        },
      },
      {
        size: 120,
        accessorKey: 'size',
        enableSorting: true,
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="평수" />
        ),
        cell: ({ row }) => {
          if (isFetching) {
            return (
              <div className="flex flex-col gap-y-3">
                <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
              </div>
            );
          }
          return (
            <div className="flex flex-col gap-y-1">
              <span className="text-gray-600">
                {formatPyeongText(calculateAreaPyeong(row.original.size))}
              </span>
              <span className="-translate-y-[1px] text-sm text-gray-500">
                {formatSizeText(Number(row.original.size))}
              </span>
            </div>
          );
        },
      },
      {
        size: 160,
        accessorKey: 'dealAmount',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="거래가격" />
        ),
        cell: ({ row }) => {
          if (isFetching) {
            return (
              <div className="flex flex-col items-end gap-y-3">
                <div className="h-5 w-20 animate-pulse rounded bg-gray-200" />
                <div className="flex items-center gap-x-2">
                  <div className="h-5 w-16 animate-pulse rounded bg-gray-200" />
                  <div className="h-5 w-16 animate-pulse rounded bg-gray-200" />
                </div>
              </div>
            );
          }
          return (
            <div className="flex flex-col gap-y-2">
              <div className="flex items-center justify-end gap-x-1">
                {!!row.original.highestTransaction &&
                  row.original.dealAmount >
                    row.original.highestTransaction.dealAmount && (
                    <PriceLabel className="bg-red-600 text-white">
                      신고가
                    </PriceLabel>
                  )}
                <span className="text-primary text-base font-bold">
                  {formatKoreanAmountText(row.original.dealAmount)}
                </span>
              </div>
              {row.original.highestTransaction &&
                row.original.lowestTransaction && (
                  <div className="flex justify-end gap-x-2">
                    <HoverCard openDelay={100}>
                      <HoverCardTrigger asChild>
                        <div
                          className="flex cursor-pointer items-center gap-x-0.5"
                          onClick={e => e.stopPropagation()}
                        >
                          <PriceLabel className="bg-red-100 text-red-600">
                            고
                          </PriceLabel>
                          <span className="text-sm text-red-600">
                            {formatKoreanAmountText(
                              row.original.highestTransaction.dealAmount
                            ).replace('원', '')}
                          </span>
                        </div>
                      </HoverCardTrigger>
                      <HoverCardContent className="w-auto">
                        <PriceTooltip
                          variant="highest"
                          dealAmount={
                            row.original.highestTransaction.dealAmount
                          }
                          dealDate={row.original.highestTransaction.dealDate}
                          size={row.original.highestTransaction.size}
                          floor={row.original.highestTransaction.floor}
                        />
                      </HoverCardContent>
                    </HoverCard>
                    <HoverCard openDelay={100}>
                      <HoverCardTrigger asChild>
                        <div
                          className="flex cursor-pointer items-center gap-x-1"
                          onClick={e => e.stopPropagation()}
                        >
                          <PriceLabel className="bg-blue-100 text-blue-600">
                            저
                          </PriceLabel>
                          <span className="text-sm text-blue-600">
                            {formatKoreanAmountText(
                              row.original.lowestTransaction.dealAmount
                            ).replace('원', '')}
                          </span>
                        </div>
                      </HoverCardTrigger>
                      <HoverCardContent className="w-auto">
                        <PriceTooltip
                          variant="lowest"
                          dealAmount={row.original.lowestTransaction.dealAmount}
                          dealDate={row.original.lowestTransaction.dealDate}
                          size={row.original.lowestTransaction.size}
                          floor={row.original.lowestTransaction.floor}
                        />
                      </HoverCardContent>
                    </HoverCard>
                  </div>
                )}
            </div>
          );
        },
      },
    ],
    [isFetching, onFavoriteToggle]
  );

  const handleDataTableSortingChange = (nextSorting: OriginSortingState) => {
    onSortingChange({
      id: nextSorting[0].id as typeof sorting.id,
      desc: nextSorting[0].desc,
    });
  };

  const handleDataTablePageIndexChange = (nextPageIndex: number) => {
    onPageIndexChange(nextPageIndex);
  };

  // 로딩 중일 때 스켈레톤 표시를 위한 더미 데이터
  const displayData =
    isFetching && items.length === 0
      ? Array.from(
          { length: TRANSACTION_LIST_PAGE_SIZE },
          (_, index) => ({ id: -index - 1 }) as TransactionItemViewModel
        )
      : items;

  const displayTotalItems =
    isFetching && totalCount === 0 ? TRANSACTION_LIST_PAGE_SIZE : totalCount;

  return (
    <DataTable
      loading={false}
      pageSize={TRANSACTION_LIST_PAGE_SIZE}
      columns={columns}
      data={displayData}
      sorting={[sorting]}
      pageIndex={pageIndex}
      totalItems={displayTotalItems}
      onSortingChange={handleDataTableSortingChange}
      onPageIndexChange={handleDataTablePageIndexChange}
      onRowClick={onRowClick}
    />
  );
}
