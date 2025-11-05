import { calculateAreaPyeong } from '@/shared/services/transactionService';
import { NewIcon } from '@/shared/ui/NewIcon';
import {
  formatDate,
  formatFloor,
  formatKoreanAmountSimpleText,
  formatPyeong,
} from '@/shared/utils/formatters';

import { Star } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import {
  ColumnDef,
  DataTable,
  DataTableColumnHeader,
  SortingState,
} from '@package/ui';
import { cn } from '@package/utils';

import { TransactionDetailItem } from '../models/types';
import { SimpleTableText } from './SimpleTableText';

interface TransactionListDataProps {
  isLoading: boolean;
  pageIndex: number;
  sorting: SortingState;
  items: TransactionDetailItem[];
  onRowClick: (row: TransactionDetailItem) => void;
  onSortingChange: (sorting: SortingState) => void;
  onPageIndexChange: (pageIndex: number) => void;
  onToggleFavorite: (item: TransactionDetailItem) => void;
}

export function TransactionListSimpleTable({
  isLoading,
  pageIndex,
  sorting,
  items,
  onRowClick,
  onSortingChange,
  onPageIndexChange,
  onToggleFavorite,
}: TransactionListDataProps) {
  const columns: ColumnDef<TransactionDetailItem>[] = useMemo(() => {
    return [
      {
        size: 30,
        accessorKey: 'favorite',
        header: () => <></>,
        cell: ({ row }) => (
          <div className="flex items-center justify-center">
            <button
              type="button"
              onClick={e => {
                e.stopPropagation();
                e.preventDefault();
                onToggleFavorite(row.original);
              }}
            >
              <Star
                className={cn(
                  'h-[14px] w-[14px]',
                  row.original.isFavorite && 'fill-yellow-400 text-yellow-400',
                  !row.original.isFavorite && 'fill-gray-300 text-gray-300'
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
          <div className="relative">
            <div className="absolute left-0 top-[-16px]">
              {row.original.isNew && <NewIcon />}
            </div>
            <SimpleTableText>
              {formatDate(row.original.tradeDate)}
            </SimpleTableText>
          </div>
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
            <SimpleTableText className="flex items-center gap-x-1 font-bold">
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
  }, [onToggleFavorite]);

  const [renderKey, setRenderKey] = useState(0);

  useEffect(() => {
    setRenderKey(prev => prev + 1);
  }, [items]);

  return (
    <DataTable
      key={renderKey}
      loading={isLoading}
      columns={columns}
      pageSize={15}
      data={items}
      pageIndex={pageIndex}
      sorting={sorting}
      onRowClick={onRowClick}
      onSortingChange={onSortingChange}
      onPageIndexChange={onPageIndexChange}
    />
  );
}
