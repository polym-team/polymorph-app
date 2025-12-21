import { calculateAreaPyeong } from '@/entities/transaction';
import {
  formatDealDate,
  formatFloorText,
  formatKoreanAmountText,
  formatNumber,
  formatPyeongText,
  formatSizeText,
} from '@/shared/utils/formatter';

import { useMemo } from 'react';

import { ColumnDef, DataTable } from '@package/ui';

import { CompareApartData } from '../types';

interface TableViewProps {
  items: CompareApartData[];
}

export function TableView({ items }: TableViewProps) {
  const columns = useMemo<ColumnDef<CompareApartData>[]>(
    () => [
      {
        accessorKey: 'apartName',
        header: '아파트명',
        cell: ({ row }) => (
          <span className="font-semibold">{row.original.apartName}</span>
        ),
        size: 200,
      },
      {
        accessorKey: 'region',
        header: '지역',
        cell: ({ row }) => (
          <span className="text-gray-600">{row.original.region}</span>
        ),
        size: 200,
      },
      {
        accessorKey: 'householdCount',
        header: '세대수',
        cell: ({ row }) =>
          row.original.householdCount
            ? `${formatNumber(row.original.householdCount)}세대`
            : '-',
        size: 100,
      },
      {
        accessorKey: 'completionYear',
        header: '연식',
        cell: ({ row }) => `${row.original.completionYear}년식`,
        size: 100,
      },
      {
        accessorKey: 'recentTransaction',
        // @ts-ignore
        header: <span className="pr-2">최근 거래</span>,
        cell: ({ row }) => {
          const recentTransaction = row.original.recentTransaction;
          if (!recentTransaction) return null;

          return (
            <div className="flex flex-col items-end gap-y-1">
              <div className="flex items-center gap-x-2">
                <span className="text-sm text-gray-500">
                  {formatDealDate(recentTransaction.dealDate)}
                </span>
                <span className="text-primary font-semibold">
                  {formatKoreanAmountText(recentTransaction.dealAmount)}
                </span>
              </div>
              <div className="flex items-center gap-x-2 text-sm text-gray-600">
                <span>{formatFloorText(recentTransaction.floor)}</span>
                <span>
                  {formatPyeongText(
                    calculateAreaPyeong(recentTransaction.size)
                  )}{' '}
                  ({formatSizeText(recentTransaction.size)})
                </span>
              </div>
            </div>
          );
        },
        size: 250,
      },
    ],
    []
  );

  return (
    <DataTable
      loading={false}
      columns={columns}
      data={items}
      sorting={[]}
      pageSize={10}
      pageIndex={0}
      totalItems={items.length}
      onSortingChange={() => {}}
      onPageIndexChange={() => {}}
    />
  );
}
