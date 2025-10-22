import { ApartDetailTradeHistoryItem } from '@/app/api/apart/types';
import { calculateAreaPyeong } from '@/shared/services/transactionService';
import { NewIcon } from '@/shared/ui/NewIcon';
import {
  formatDate,
  formatFloor,
  formatKoreanAmountSimpleText,
  formatPyeong,
} from '@/shared/utils/formatters';

import { ColumnDef, DataTable, DataTableColumnHeader } from '@package/ui';

import { useTransactionHistoryTableData } from '../hooks/useTransactionHistoryTableData';
import { TradeItemViewModel } from '../models/types';
import { PriceChangeRateBadge } from '../ui/PriceChangeRateBadge';

interface ApartTransactionHistoryTableProps {
  apartName: string;
  regionCode: string;
  tradeItems: ApartDetailTradeHistoryItem[];
}

const columns: ColumnDef<TradeItemViewModel>[] = [
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
        {formatDate(row.original.tradeDate)}
      </div>
    ),
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
  apartName,
  regionCode,
  tradeItems,
}: ApartTransactionHistoryTableProps) {
  const { sorting, mappedTradeItems, changeSorting } =
    useTransactionHistoryTableData({ apartName, regionCode, tradeItems });

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
