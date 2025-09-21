import { TransactionItem } from '@/entities/transaction';
import {
  formatDate,
  formatFloor,
  formatKoreanAmountSimpleText,
  formatSizeWithPyeong,
} from '@/shared/utils/formatters';

import { Star } from 'lucide-react';

import {
  ColumnDef,
  DataTable,
  DataTableColumnHeader,
  SortingState,
} from '@package/ui';

import { SimpleTableText } from './SimpleTableText';

interface TransactionListDataProps {
  pageIndex: number;
  sorting: SortingState;
  items: TransactionItem[];
  onSortingChange: (sorting: SortingState) => void;
  onPageIndexChange: (pageIndex: number) => void;
}

const columns: ColumnDef<TransactionItem>[] = [
  {
    size: 30,
    accessorKey: 'favorite',
    header: () => <></>,
    cell: () => (
      <div className="flex">
        <button type="button" onClick={() => {}}>
          <Star className="h-[14px] w-[14px]" />
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
    accessorKey: 'size',
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
            {formatSizeWithPyeong(row.original.size)}
          </SimpleTableText>
        )}
      </>
    ),
  },
  {
    size: 100,
    accessorKey: 'maxTradeAmount',
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

export function TransactionListSimpleTable({
  items,
  pageIndex,
  sorting,
  onSortingChange,
  onPageIndexChange,
}: TransactionListDataProps) {
  return (
    <DataTable
      columns={columns}
      pageSize={20}
      data={items}
      pageIndex={pageIndex}
      sorting={sorting}
      onSortingChange={onSortingChange}
      onPageIndexChange={onPageIndexChange}
    />
  );
}
