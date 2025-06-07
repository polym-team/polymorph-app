'use client';

import { ApartDetailResponse } from '@/app/api/apart/types';
import { formatPrice } from '@/features/transaction-list/services/formatter';
import { TransactionItem } from '@/shared/models/types';

import { Info as LucideInfo } from 'lucide-react';

import {
  Card,
  ColumnDef,
  DataTable,
  DataTableColumnHeader,
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
  Typography,
} from '@package/ui';

import { useTransactionHistory } from '../hooks/useTransactionHistory';

interface Props {
  items: ApartDetailResponse['tradeItems'];
}

const columns: ColumnDef<TransactionItem>[] = [
  {
    accessorKey: 'tradeDate',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="거래일" />
    ),
    cell: ({ row }) => <Typography>{row.getValue('tradeDate')}</Typography>,
    size: 120,
  },
  {
    accessorKey: 'size',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="면적/평수" />
    ),
    cell: ({ row }) => {
      const size = row.getValue('size') as number;
      const pyeong = row.original.pyeong;
      return (
        <div className="flex items-center gap-x-1">
          <Typography>{pyeong}평</Typography>
          <Typography className="text-sm text-gray-500">({size}㎡)</Typography>
        </div>
      );
    },
    size: 100,
  },
  {
    accessorKey: 'floor',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="층" />
    ),
    cell: ({ row }) => <Typography>{row.getValue('floor')}층</Typography>,
    size: 80,
  },
  {
    accessorKey: 'tradeAmount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="거래가격" />
    ),
    cell: ({ row }) => {
      const amount = row.getValue('tradeAmount') as number;
      return (
        <Typography className="text-primary font-bold">
          {formatPrice(amount)}
        </Typography>
      );
    },
    size: 150,
  },
  {
    accessorKey: 'pricePerPyeong',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="평당가격" />
    ),
    cell: ({ row }) => {
      const pricePerPyeong = row.getValue('pricePerPyeong') as number;
      return <Typography>{formatPrice(pricePerPyeong)}</Typography>;
    },
    size: 130,
  },
  {
    accessorKey: 'priceChange',
    header: () => (
      <div className="font-semibold text-gray-700">
        가격변동
        <HoverCard openDelay={0} closeDelay={0}>
          <HoverCardTrigger asChild>
            <div className="ml-1 inline-block translate-y-[2px]">
              <LucideInfo className="text-primary h-4 w-4 cursor-help" />
            </div>
          </HoverCardTrigger>
          <HoverCardContent className="w-80">
            <p className="text-sm font-light">같은 평수 기준 변동된 실거래가</p>
          </HoverCardContent>
        </HoverCard>
      </div>
    ),
    cell: ({ row }) => {
      const priceChange = row.original.priceChange;
      if (!priceChange) return null;

      return (
        <div
          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
            priceChange.isUp
              ? 'bg-red-100 text-red-700'
              : priceChange.isDown
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-700'
          }`}
        >
          {priceChange.isUp ? '↗' : priceChange.isDown ? '↘' : '→'}{' '}
          {Math.abs(Number(priceChange.change))}%
        </div>
      );
    },
    size: 100,
  },
];

const mobileColumnTitles = {
  tradeDate: '거래일',
  size: '면적/평수',
  floor: '층',
  tradeAmount: '거래가격',
  pricePerPyeong: '평당가격',
  priceChange: '가격변동',
};

function TransactionHistory({ items }: Props) {
  const { processedItems, sorting, setSorting, pageSize, setPageSize } =
    useTransactionHistory(items);

  if (!items || items.length === 0) {
    return (
      <Card className="p-6">
        <Typography variant="large" className="mb-4 font-semibold">
          거래 내역
        </Typography>
        <div className="py-8 text-center text-gray-500">
          거래 내역이 없습니다.
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-5">
      <Typography variant="large" className="mb-5 font-semibold">
        거래 내역{' '}
        <strong className="text-primary">({processedItems.length}건)</strong>
      </Typography>

      <DataTable
        columns={columns}
        data={processedItems}
        sorting={sorting}
        onSortingChange={setSorting}
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
        mobileColumnTitles={mobileColumnTitles}
        emptyMessage="거래 내역이 없습니다."
        showPagination={true}
      />
    </Card>
  );
}

export default TransactionHistory;
