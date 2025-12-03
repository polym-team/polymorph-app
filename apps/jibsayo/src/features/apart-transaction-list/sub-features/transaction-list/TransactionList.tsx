import { ApartTransactionItem } from '@/entities/apart-transaction';
import { calculateAreaPyeong } from '@/entities/transaction';
import { NewTransactionIcon } from '@/shared/ui/NewTransactionIcon';
import {
  formatFloorText,
  formatKoreanAmountText,
  formatPyeongText,
  formatTransactionDate,
} from '@/shared/utils/formatter';

import { ColumnDef, DataTable, DataTableColumnHeader } from '@package/ui';

import { TRANSACTION_LIST_PAGE_SIZE } from './consts';
import { PriceChangeRateBadge } from './PriceChangeRateBadge';
import { TransactionItemViewModel } from './types';
import { useTransactionList } from './useTransactionList';

interface TransactionListProps {
  regionCode: string;
  transactionItems: ApartTransactionItem[];
}

const columns: ColumnDef<TransactionItemViewModel>[] = [
  {
    size: 90,
    accessorKey: 'tradeDate',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="거래일" />
    ),
    cell: ({ row }) => (
      <div className="relative">
        <span className="absolute left-0 top-[-16px]">
          {row.original.isNewTransaction && <NewTransactionIcon />}
        </span>
        <span className="text-sm text-gray-500 lg:text-base">
          {formatTransactionDate(row.original.tradeDate)}
        </span>
      </div>
    ),
  },
  {
    size: 130,
    enableSorting: false,
    accessorKey: 'size',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="층 / 평수" />
    ),
    cell: ({ row }) => (
      <span className="flex gap-x-1 text-sm text-gray-600 lg:text-base">
        {formatFloorText(row.original.floor)} /{' '}
        {formatPyeongText(calculateAreaPyeong(row.original.size))}
      </span>
    ),
  },
  {
    size: Infinity,
    accessorKey: 'tradeAmount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="거래가격" />
    ),
    cell: ({ row }) => (
      <div className="flex flex-wrap items-center justify-end gap-x-2 gap-y-1">
        {row.original.priceChangeRate !== 0 && (
          <span className="translate-x-[1px]">
            <PriceChangeRateBadge
              priceChangeRate={row.original.priceChangeRate}
              previousTradeItem={row.original.prevTransactionItem}
            />
          </span>
        )}
        <span className="text-primary font-bold">
          {formatKoreanAmountText(row.original.tradeAmount)}
        </span>
      </div>
    ),
  },
];

export function TransactionList({
  regionCode,
  transactionItems,
}: TransactionListProps) {
  const {
    sorting,
    pageIndex,
    totalCount,
    items,
    changeSorting,
    changePageIndex,
  } = useTransactionList({
    regionCode,
    transactionItems,
  });

  return (
    <div className="space-y-2">
      <DataTable
        pageSize={TRANSACTION_LIST_PAGE_SIZE}
        columns={columns}
        data={items}
        sorting={sorting}
        pageIndex={pageIndex}
        totalItems={totalCount}
        onSortingChange={changeSorting}
        onPageIndexChange={changePageIndex}
      />
    </div>
  );
}
