import { TransactionItem } from '@/entities/transaction';
import {
  formatFloor,
  formatKoreanAmountSimpleText,
  formatSizeWithPyeong,
} from '@/shared/utils/formatters';

import { ColumnDef, DataTable, DataTableColumnHeader } from '@package/ui';

import { SimpleTableText } from './SimpleTableText';

interface TransactionListDataProps {
  pageIndex: number;
  items: TransactionItem[];
}

const columns: ColumnDef<TransactionItem>[] = [
  {
    size: 100,
    accessorKey: 'tradeDate',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="거래일" />
    ),
  },
  {
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
          <SimpleTableText>
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
}: TransactionListDataProps) {
  return (
    <DataTable
      columns={columns}
      pageSize={20}
      data={items}
      sorting={[]}
      onSortingChange={() => {}}
    />
  );
}
