'use client';

import { TransactionsResponse } from '@/app/api/transactions/types';

import {
  ColumnDef,
  DataTable,
  DataTableColumnHeader,
  Input,
  LabelCheckbox,
  Typography,
} from '@package/ui';

import { useTransactionData } from '../hooks/useTransactionData';
import { useTransactionFilter } from '../hooks/useTransactionFilter';
import { useTransactionViewSetting } from '../hooks/useTransactionViewSetting';
import { useTransactionListQuery } from '../models/useTransactionListQuery';
import { formatPrice, formatSizeWithPyeong } from '../services/formatter';

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
  const transactions = data?.list ?? [];

  const {
    searchTerm,
    isNationalSizeOnly,
    filteredTransactions,
    setSearchTerm,
    setIsNationalSizeOnly,
  } = useTransactionFilter(transactions);

  const { totalCount, averagePrice, fullRegionName } =
    useTransactionData(filteredTransactions);

  const { sorting, pageSize, updateSorting, updatePageSize, isMounted } =
    useTransactionViewSetting();

  // SSR 환경에서는 기본값 사용, 클라이언트에서는 저장된 설정 사용
  const effectivePageSize = isMounted ? pageSize : 10;
  const effectiveSorting = isMounted ? sorting : [];

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-x-1">
          {transactions.length > 0 && (
            <>
              <Typography className="font-bold">{fullRegionName}</Typography>
              <Typography variant="small">
                (총 거래 건수{' '}
                <span className="text-primary font-bold">
                  {filteredTransactions.length}건
                </span>
                {totalCount !== filteredTransactions.length && (
                  <span className="text-gray-500">/{totalCount}건</span>
                )}
                <span className="mx-1 text-gray-400">·</span>
                평균 거래가격{' '}
                <span className="text-primary font-bold">
                  {formatPrice(averagePrice)}
                </span>
                )
              </Typography>
            </>
          )}
        </div>
        <div className="flex items-center gap-x-2">
          <LabelCheckbox
            checked={false}
            onCheckedChange={() => {}}
            title="저장된 아파트"
          />
          <LabelCheckbox
            checked={isNationalSizeOnly}
            onCheckedChange={setIsNationalSizeOnly}
            title="국민평수"
          />
          <Input
            placeholder="아파트명 검색"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-64"
          />
        </div>
      </div>
      <DataTable
        columns={columns}
        data={filteredTransactions}
        emptyMessage={
          isLoading
            ? '데이터를 불러오는 중입니다.'
            : '검색 조건에 맞는 실거래가 데이터가 없습니다.'
        }
        sorting={effectiveSorting}
        pageSize={effectivePageSize}
        onSortingChange={updateSorting}
        onPageSizeChange={updatePageSize}
      />
    </div>
  );
}
