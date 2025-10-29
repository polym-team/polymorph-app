import { FavoriteApartToggleButton } from '@/entities/apart';
import { calculateAreaPyeong } from '@/shared/services/transactionService';
import { NewIcon } from '@/shared/ui/NewIcon';
import {
  formatDate,
  formatFloor,
  formatKoreanAmountSimpleText,
  formatPyeong,
} from '@/shared/utils/formatters';

import { useMemo } from 'react';

import {
  ColumnDef,
  DataTable,
  DataTableColumnHeader,
  SortingState,
} from '@package/ui';

import { TransactionDetailItem } from '../models/types';
import { SimpleTableText } from './SimpleTableText';

interface TransactionListDataProps {
  isLoading: boolean;
  pageIndex: number;
  sorting: SortingState;
  items: TransactionDetailItem[];
  regionCode: string;
  onRowClick: (row: TransactionDetailItem) => void;
  onSortingChange: (sorting: SortingState) => void;
  onPageIndexChange: (pageIndex: number) => void;
}

export function TransactionListSimpleTable({
  isLoading,
  pageIndex,
  sorting,
  items,
  regionCode,
  onRowClick,
  onSortingChange,
  onPageIndexChange,
}: TransactionListDataProps) {
  const columns: ColumnDef<TransactionDetailItem>[] = useMemo(() => {
    return [
      {
        size: 30,
        accessorKey: 'favorite',
        header: () => <></>,
        cell: ({ row }) => (
          <div className="flex items-center">
            <FavoriteApartToggleButton
              size="base"
              isFavorite={row.original.isFavorite}
              data={{
                regionCode,
                apartName: row.original.apartName,
                address: row.original.address,
              }}
            />
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
              {row.original.isNewTransaction && <NewIcon />}
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
  }, [regionCode]);

  return (
    <DataTable
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
