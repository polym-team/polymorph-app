import { calculateAreaPyeong } from '@/entities/transaction';
import { NewTransactionIcon } from '@/shared/ui/NewTransactionIcon';
import {
  formatDealDate,
  formatFloorText,
  formatKoreanAmountText,
  formatPyeongText,
  formatSizeText,
} from '@/shared/utils/formatter';

import { Star } from 'lucide-react';
import { useMemo } from 'react';

import {
  ColumnDef,
  DataTable,
  DataTableColumnHeader,
  SortingState as OriginSortingState,
} from '@package/ui';
import { cn } from '@package/utils';

import { TRANSACTION_LIST_PAGE_SIZE } from '../../../consts';
import { Sorting, TransactionItemViewModel } from '../../../types';

interface TransactionTableListProps {
  isLoading: boolean;
  sorting: Sorting;
  pageIndex: number;
  totalCount: number;
  items: TransactionItemViewModel[];
  onSortingChange: (sorting: Sorting) => void;
  onPageIndexChange: (pageIndex: number) => void;
  onFavoriteToggle: (item: TransactionItemViewModel) => void;
  onRowClick: (item: TransactionItemViewModel) => void;
}

export function TransactionTableList({
  isLoading,
  sorting,
  pageIndex,
  totalCount,
  items,
  onSortingChange,
  onPageIndexChange,
  onFavoriteToggle,
  onRowClick,
}: TransactionTableListProps) {
  const columns: ColumnDef<TransactionItemViewModel>[] = useMemo(
    () => [
      {
        size: 50,
        accessorKey: 'favorite',
        header: () => <></>,
        cell: ({ row }) =>
          row.original.apartId ? (
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
          ) : null,
      },
      {
        size: 120,
        accessorKey: 'tradeDate',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="거래일" />
        ),
        cell: ({ row }) => (
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
        ),
      },
      {
        size: Infinity,
        accessorKey: 'apartName',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="아파트명" />
        ),
        cell: ({ row }) => (
          <span className="font-semibold">{row.original.apartName}</span>
        ),
      },
      {
        size: 120,
        accessorKey: 'floor',
        enableSorting: true,
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="층" />
        ),
        cell: ({ row }) => (
          <span className="text-gray-600">
            {row.original.floor ? formatFloorText(row.original.floor) : ''}
          </span>
        ),
      },
      {
        size: 180,
        accessorKey: 'size',
        enableSorting: true,
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="평수" />
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-x-1">
            <span className="text-gray-600">
              {formatPyeongText(calculateAreaPyeong(row.original.size))}
            </span>
            <span className="-translate-y-[1px] text-sm text-gray-500">
              ({formatSizeText(Number(row.original.size))})
            </span>
          </div>
        ),
      },
      {
        size: 150,
        accessorKey: 'dealAmount',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="거래가격" />
        ),
        cell: ({ row }) => (
          <span className="text-primary text-base font-bold">
            {formatKoreanAmountText(row.original.dealAmount)}
          </span>
        ),
      },
    ],
    [onFavoriteToggle]
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

  return (
    <DataTable
      loading={isLoading}
      pageSize={TRANSACTION_LIST_PAGE_SIZE}
      columns={columns}
      data={items}
      sorting={[sorting]}
      pageIndex={pageIndex}
      totalItems={totalCount}
      onSortingChange={handleDataTableSortingChange}
      onPageIndexChange={handleDataTablePageIndexChange}
      onRowClick={onRowClick}
    />
  );
}
