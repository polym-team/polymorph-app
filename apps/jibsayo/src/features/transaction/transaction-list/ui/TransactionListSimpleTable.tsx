import { calculateAreaPyeong } from '@/shared/services/transactionCalculator';
import {
  formatDate,
  formatFloor,
  formatKoreanAmountSimpleText,
  formatPyeong,
} from '@/shared/utils/formatters';

import { Star } from 'lucide-react';

import {
  ColumnDef,
  DataTable,
  DataTableColumnHeader,
  SortingState,
} from '@package/ui';
import { cn } from '@package/utils';

import { TransactionItemWithFavorite } from '../models/types';
import { SimpleTableText } from './SimpleTableText';

interface TransactionListDataProps {
  isLoading: boolean;
  pageIndex: number;
  sorting: SortingState;
  items: TransactionItemWithFavorite[];
  onSortingChange: (sorting: SortingState) => void;
  onPageIndexChange: (pageIndex: number) => void;
  onFavoriteToggle: (transaction: TransactionItemWithFavorite) => void;
}

const createColumns = (
  onFavoriteToggle: (transaction: TransactionItemWithFavorite) => void
): ColumnDef<TransactionItemWithFavorite>[] => {
  return [
    {
      size: 30,
      accessorKey: 'favorite',
      header: () => <></>,
      cell: ({ row }) => (
        <div className="flex">
          <button type="button" onClick={() => onFavoriteToggle(row.original)}>
            <Star
              className={cn(
                'h-[14px] w-[14px]',
                row.original.isFavorite
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'fill-gray-300 text-gray-300'
              )}
            />
          </button>
        </div>
      ),
    },
    {
      size: 80,
      accessorKey: 'tradeDate',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="거래일" />
      ),
      cell: ({ row }) => (
        <SimpleTableText>{formatDate(row.original.tradeDate)}</SimpleTableText>
      ),
    },
    {
      size: Infinity,
      accessorKey: 'apartName',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="아파트명" />
      ),
      cell: ({ row }) => (
        <>
          <SimpleTableText className="font-bold">
            {row.original.apartName}
          </SimpleTableText>
          {row.original.floor && (
            <SimpleTableText className="text-sm">
              {formatFloor(row.original.floor)} /{' '}
              {formatPyeong(calculateAreaPyeong(row.original.size))}
            </SimpleTableText>
          )}
        </>
      ),
    },
    {
      size: 100,
      accessorKey: 'tradeAmount',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="거래가격" />
      ),
      cell: ({ row }) => (
        <SimpleTableText className="text-primary font-bold">
          {formatKoreanAmountSimpleText(row.original.tradeAmount)}
        </SimpleTableText>
      ),
    },
  ];
};

export function TransactionListSimpleTable({
  isLoading,
  pageIndex,
  items,
  sorting,
  onSortingChange,
  onPageIndexChange,
  onFavoriteToggle,
}: TransactionListDataProps) {
  const columns = createColumns(onFavoriteToggle);

  return (
    <DataTable
      loading={isLoading}
      columns={columns}
      pageSize={15}
      data={items}
      pageIndex={pageIndex}
      sorting={sorting}
      onSortingChange={onSortingChange}
      onPageIndexChange={onPageIndexChange}
    />
  );
}
