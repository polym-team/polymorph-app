import { ApartDetailResponse } from '@/app/api/apart/types';
import { calculateAreaPyeong } from '@/shared/services/transactionService';
import {
  formatDate,
  formatFloor,
  formatKoreanAmountSimpleText,
  formatPyeong,
  formatSize,
} from '@/shared/utils/formatters';

import {
  Card,
  ColumnDef,
  DataTable,
  DataTableColumnHeader,
  SortingState,
  Typography,
} from '@package/ui';

interface ApartTransactionHistoryTableProps {
  sorting: SortingState;
  tradeItems: ApartDetailResponse['tradeItems'];
  onChangeSorting: (newSorting: SortingState) => void;
}

const columns: ColumnDef<ApartDetailResponse['tradeItems'][number]>[] = [
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
      <div>
        <span className="text-primary font-bold">
          {formatKoreanAmountSimpleText(row.original.tradeAmount)}
        </span>
        ↗10.09%
      </div>
    ),
  },
];

export function ApartTransactionHistoryTable({
  sorting,
  tradeItems,
  onChangeSorting,
}: ApartTransactionHistoryTableProps) {
  return (
    <Card className="p-3">
      <Typography variant="large" className="font-semibold">
        거래 내역
      </Typography>
      <DataTable
        pageSize={20}
        columns={columns}
        data={tradeItems}
        sorting={sorting}
        onSortingChange={onChangeSorting}
      />
    </Card>
  );
}
