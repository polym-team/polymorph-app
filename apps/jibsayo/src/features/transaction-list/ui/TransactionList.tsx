'use client';

import { TransactionsResponse } from '@/app/api/transactions/types';

import { ColumnDef, DataTable, DataTableColumnHeader } from '@package/ui';

import { useTransactionListQuery } from '../models/useTransactionListQuery';
import { formatPrice } from '../service/formatter';

// 평수 계산 함수 (㎡ -> 평, 공급면적 기준)
const formatSizeWithPyeong = (exclusiveAreaInSquareMeters: number): string => {
  // 공급면적 = 전용면적 × 1.35 (일반적인 계수)
  const supplyArea = exclusiveAreaInSquareMeters * 1.35;
  const pyeong = Math.round(supplyArea / 3.3);
  return `${pyeong}평(${exclusiveAreaInSquareMeters}㎡)`;
};

const columns: ColumnDef<TransactionsResponse['list'][number]>[] = [
  {
    accessorKey: 'tradeDate',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="거래일" />
    ),
    size: 120,
  },
  {
    accessorKey: 'address',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="주소지" />
    ),
    size: 200,
  },
  {
    accessorKey: 'apartName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="아파트명" />
    ),
    size: 260,
  },
  {
    accessorKey: 'size',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="평수" />
    ),
    cell: ({ row }) => {
      const size = row.getValue('size') as number;
      return <div>{formatSizeWithPyeong(size)}</div>;
    },
    size: 120,
  },
  {
    accessorKey: 'tradeAmount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="거래가격" />
    ),
    cell: ({ row }) => {
      const amount = row.getValue('tradeAmount') as number;
      return (
        <div className="text-primary font-bold">{formatPrice(amount)}</div>
      );
    },
    size: 150,
  },
  {
    accessorKey: 'isNewRecord',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="신고가" />
    ),
    cell: ({ row }) => {
      const isHigh = row.getValue('isNewRecord') as boolean;
      return (
        <div className={isHigh ? 'font-medium text-red-600' : ''}>
          {isHigh ? '신고가' : ''}
        </div>
      );
    },
    size: 80,
  },
];

export function TransactionList() {
  const { isLoading, data } = useTransactionListQuery();

  return (
    <div className="w-full">
      <DataTable
        columns={columns}
        data={data?.list ?? []}
        emptyMessage={
          isLoading
            ? '데이터를 불러오는 중입니다.'
            : '검색 조건에 맞는 실거래가 데이터가 없습니다.'
        }
      />
    </div>
  );
}
