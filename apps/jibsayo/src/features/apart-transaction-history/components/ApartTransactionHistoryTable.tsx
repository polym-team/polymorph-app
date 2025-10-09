import { ApartDetailTradeHistoryItem } from '@/app/api/apart/types';
import { calculateAreaPyeong } from '@/shared/services/transactionService';
import {
  formatDate,
  formatFloor,
  formatKoreanAmountSimpleText,
  formatPercent,
  formatPyeong,
} from '@/shared/utils/formatters';

import { ColumnDef, DataTable, DataTableColumnHeader } from '@package/ui';
import { cn } from '@package/utils';

import { useTransactionHistoryTableData } from '../hooks/useTransactionHistoryTableData';
import { TradeItemWithPriceChangeRate } from '../models/types';

interface ApartTransactionHistoryTableProps {
  tradeItems: ApartDetailTradeHistoryItem[];
}

const columns: ColumnDef<TradeItemWithPriceChangeRate>[] = [
  {
    size: 80,
    accessorKey: 'tradeDate',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="거래일" />
    ),
    cell: ({ row }) => formatDate(row.original.tradeDate),
  },
  {
    size: 100,
    accessorKey: 'floor',
    enableSorting: false,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="층/평수" />
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-x-1">
        {formatFloor(row.original.floor)} /{' '}
        {formatPyeong(calculateAreaPyeong(row.original.size))}
      </div>
    ),
  },
  {
    size: Infinity,
    accessorKey: 'tradeAmount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="거래가격" />
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-end gap-x-1">
        {row.original.priceChangeRate !== 0 && (
          <span
            className={cn(
              'rounded-full px-1 pb-0.5 text-xs',
              row.original.priceChangeRate > 0
                ? 'bg-red-100 text-red-700'
                : 'bg-blue-100 text-blue-700'
            )}
          >
            {row.original.priceChangeRate > 0 ? '↗' : '↘'}{' '}
            {formatPercent(row.original.priceChangeRate)}
          </span>
        )}
        <span className="text-primary font-bold">
          {formatKoreanAmountSimpleText(row.original.tradeAmount)}
        </span>
      </div>
    ),
  },
];

export function ApartTransactionHistoryTable({
  tradeItems,
}: ApartTransactionHistoryTableProps) {
  const { sorting, mappedTradeItems, changeSorting } =
    useTransactionHistoryTableData(tradeItems);

  return (
    <DataTable
      pageSize={20}
      columns={columns}
      data={mappedTradeItems}
      sorting={sorting}
      onSortingChange={changeSorting}
    />
  );
}
