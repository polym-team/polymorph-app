import { TransactionItem } from '@/entities/transaction';

import { useState } from 'react';

import {
  ColumnDef,
  DataTable,
  DataTableColumnHeader,
  SortingState,
} from '@package/ui';

interface TransactionListDataProps {
  pageIndex: number;
  sorting: SortingState;
  items: TransactionItem[];
}

const columns: ColumnDef<TransactionItem>[] = [
  {
    accessorKey: 'tradeDate',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="거래일" />
    ),
  },
  {
    accessorKey: 'address',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="주소지" />
    ),
  },
  {
    accessorKey: 'apartName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="아파트명" />
    ),
  },
  {
    accessorKey: 'size',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="평수" />
    ),
  },
  {
    accessorKey: 'tradeAmount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="거래가격" />
    ),
  },
  {
    accessorKey: 'maxTradeAmount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="최고가" />
    ),
  },
];

export function TransactionListDetailTable({
  pageIndex,
  sorting,
  items,
}: TransactionListDataProps) {
  return (
    <DataTable
      columns={columns}
      data={items}
      pageIndex={pageIndex}
      sorting={sorting}
      onSortingChange={() => {}}
    />
  );
}
