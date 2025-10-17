import { ApartDetailTradeHistoryItem } from '@/app/api/apart/types';
import { calculateAreaPyeong } from '@/shared/services/transactionService';
import {
  formatDate,
  formatFloor,
  formatKoreanAmountSimpleText,
  formatPyeong,
} from '@/shared/utils/formatters';

import { ColumnDef, DataTable, DataTableColumnHeader } from '@package/ui';

import { useTransactionHistoryTableData } from '../hooks/useTransactionHistoryTableData';
import { TradeItemWithPriceChangeRate } from '../models/types';
import { PriceChangeRateBadge } from '../ui/PriceChangeRateBadge';

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
          <PriceChangeRateBadge
            priceChangeRate={row.original.priceChangeRate}
            previousTradeItem={row.original.previousTradeItem}
          />
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
