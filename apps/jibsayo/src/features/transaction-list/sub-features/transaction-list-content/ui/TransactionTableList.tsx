import { calculateAreaPyeong } from '@/entities/transaction';
import { NewTransactionIcon } from '@/shared/ui/NewTransactionIcon';
import {
  formatFloorText,
  formatKoreanAmountText,
  formatPyeongText,
  formatTransactionDate,
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
import {
  PageIndexState,
  SortingState,
  SummaryState,
  TransactionItemViewModel,
} from '../../../types';

interface TransactionTableListProps {
  isLoading: boolean;
  summary: SummaryState;
  sorting: SortingState;
  pageIndex: PageIndexState;
  items: TransactionItemViewModel[];
  onFavoriteToggle: (item: TransactionItemViewModel) => void;
  onRowClick: (item: TransactionItemViewModel) => void;
}

export function TransactionTableList({
  isLoading,
  sorting,
  summary,
  pageIndex,
  items,
  onFavoriteToggle,
  onRowClick,
}: TransactionTableListProps) {
  const columns: ColumnDef<TransactionItemViewModel>[] = useMemo(
    () => [
      {
        size: 50,
        accessorKey: 'favorite',
        header: () => <></>,
        cell: ({ row }) => (
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
        ),
      },
      {
        size: 120,
        accessorKey: 'tradeDate',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="거래일" />
        ),
        cell: ({ row }) => (
          <span className="relative">
            {row.original.isNew && (
              <span className="absolute -top-5 left-0">
                <NewTransactionIcon />
              </span>
            )}
            <span className="text-sm text-gray-600">
              {formatTransactionDate(row.original.tradeDate)}
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
        size: 120,
        accessorKey: 'size',
        enableSorting: true,
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="평수" />
        ),
        cell: ({ row }) => (
          <span className="text-gray-600">
            {formatPyeongText(calculateAreaPyeong(row.original.size))}
          </span>
        ),
      },
      {
        size: 150,
        accessorKey: 'tradeAmount',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="거래가격" />
        ),
        cell: ({ row }) => (
          <span className="text-primary text-base font-bold">
            {formatKoreanAmountText(row.original.tradeAmount)}
          </span>
        ),
      },
    ],
    [onFavoriteToggle]
  );

  const totalItems = summary.transactionTotalCount;
  const dataTableSorting = [{ id: sorting.state.id, desc: sorting.state.desc }];
  const dataTablePageIndex = pageIndex.state;

  const onDataTableSortingChange = (nextSorting: OriginSortingState) => {
    sorting.update({
      id: nextSorting[0].id as typeof sorting.state.id,
      desc: nextSorting[0].desc,
    });
  };

  const onDataTablePageIndexChange = (nextPageIndex: number) => {
    pageIndex.update(nextPageIndex);
  };

  return (
    <DataTable
      loading={isLoading}
      pageSize={TRANSACTION_LIST_PAGE_SIZE}
      columns={columns}
      data={items}
      sorting={dataTableSorting}
      pageIndex={dataTablePageIndex}
      totalItems={totalItems}
      onSortingChange={onDataTableSortingChange}
      onPageIndexChange={onDataTablePageIndexChange}
      onRowClick={onRowClick}
    />
  );
}
