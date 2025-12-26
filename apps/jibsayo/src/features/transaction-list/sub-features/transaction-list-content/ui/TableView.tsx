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

import { ArrowDown, ArrowUp, Star } from 'lucide-react';
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
import { cn } from '@package/utils';

import { TRANSACTION_LIST_PAGE_SIZE } from '../../../consts';
import { Sorting, TransactionItemViewModel } from '../../../types';

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
        size: 50,
        accessorKey: 'favorite',
        header: () => <></>,
        cell: ({ row }) => {
          if (isFetching) {
            return (
              <div className="py-2">
                <div className="h-4 w-4 animate-pulse rounded-full bg-gray-200" />
              </div>
            );
          }
          return row.original.apartId ? (
            <button
              className="flex items-center"
              onClick={e => {
                e.stopPropagation();
                e.preventDefault();
                onFavoriteToggle(row.original);
              }}
            >
              <Star
                className={cn(
                  'h-[16px] w-[16px]',
                  row.original.isFavorite && 'fill-yellow-400 text-yellow-400',
                  !row.original.isFavorite && 'fill-gray-300 text-gray-300'
                )}
              />
            </button>
          ) : null;
        },
      },
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
            <span className="relative">
              {row.original.isNewTransaction && (
                <span className="absolute -top-5 left-0">
                  <NewTransactionIcon />
                </span>
              )}
              <span className="text-sm text-gray-600">
                {formatDealDate(row.original.dealDate)}
              </span>
            </span>
          );
        },
      },
      {
        size: 100,
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
            <div className="flex flex-col gap-y-1">
              <span className="font-semibold">{row.original.apartName}</span>
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
        size: 120,
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
        size: 180,
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
        size: 200,
        accessorKey: 'dealAmount',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="거래가격" />
        ),
        cell: ({ row }) => {
          if (isFetching) {
            return (
              <div className="flex flex-col items-end gap-y-3">
                <div className="h-5 w-20 animate-pulse rounded bg-gray-200" />
                <div className="flex items-center gap-x-1">
                  <div className="h-4 w-12 animate-pulse rounded bg-gray-200" />
                  <div className="h-4 w-12 animate-pulse rounded bg-gray-200" />
                </div>
              </div>
            );
          }
          return (
            <div className="flex flex-col items-end gap-y-1">
              <span className="text-primary text-base font-bold">
                {formatKoreanAmountText(row.original.dealAmount)}
              </span>
              {row.original.highestTransaction &&
                row.original.lowestTransaction && (
                  <div className="flex items-center gap-x-1">
                    <HoverCard openDelay={100}>
                      <HoverCardTrigger asChild>
                        <span
                          className="flex cursor-pointer items-center gap-x-[1px] text-sm text-red-600"
                          onClick={e => e.stopPropagation()}
                        >
                          <ArrowUp size={14} />
                          {formatKoreanAmountText(
                            row.original.highestTransaction.dealAmount
                          ).replace('원', '')}
                        </span>
                      </HoverCardTrigger>
                      <HoverCardContent className="w-auto">
                        <div className="w-32 space-y-2">
                          <div className="text-left text-sm font-semibold text-red-600">
                            역대 최고가
                          </div>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-500">거래가격</span>
                              <span>
                                {formatKoreanAmountText(
                                  row.original.highestTransaction.dealAmount
                                )}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">거래일</span>
                              <span>
                                {formatDealDate(
                                  row.original.highestTransaction.dealDate
                                )}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">평형</span>
                              <span>
                                {formatPyeongText(
                                  calculateAreaPyeong(
                                    row.original.highestTransaction.size
                                  )
                                )}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">층</span>
                              <span>
                                {formatFloorText(
                                  row.original.highestTransaction.floor
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                    <HoverCard openDelay={100}>
                      <HoverCardTrigger asChild>
                        <span
                          className="flex cursor-pointer items-center gap-x-[1px] text-sm text-blue-600"
                          onClick={e => e.stopPropagation()}
                        >
                          <ArrowDown size={14} />
                          {formatKoreanAmountText(
                            row.original.lowestTransaction.dealAmount
                          ).replace('원', '')}
                        </span>
                      </HoverCardTrigger>
                      <HoverCardContent className="w-auto">
                        <div className="w-32 space-y-2">
                          <div className="text-left text-sm font-semibold text-blue-600">
                            최근 5년 최저가
                          </div>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-500">거래가격</span>
                              <span>
                                {formatKoreanAmountText(
                                  row.original.lowestTransaction.dealAmount
                                )}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">거래일</span>
                              <span>
                                {formatDealDate(
                                  row.original.lowestTransaction.dealDate
                                )}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">평형</span>
                              <span>
                                {formatPyeongText(
                                  calculateAreaPyeong(
                                    row.original.lowestTransaction.size
                                  )
                                )}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">층</span>
                              <span>
                                {formatFloorText(
                                  row.original.lowestTransaction.floor
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
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
