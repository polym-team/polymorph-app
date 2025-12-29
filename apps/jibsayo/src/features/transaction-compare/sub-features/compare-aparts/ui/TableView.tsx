import { calculateAreaPyeong } from '@/entities/transaction';
import {
  formatDealDate,
  formatFloorText,
  formatKoreanAmountText,
  formatNumber,
  formatPyeongText,
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
        size: 250,
      },
      {
        accessorKey: 'region',
        header: '지역',
        cell: ({ row }) => (
          <span className="text-gray-600">{row.original.region}</span>
        ),
        size: 250,
      },
      {
        accessorKey: 'householdCount',
        header: '세대수',
        cell: ({ row }) =>
          row.original.householdCount
            ? `${formatNumber(row.original.householdCount)}세대`
            : '-',
        size: 120,
      },
      {
        accessorKey: 'completionYear',
        header: '연식',
        cell: ({ row }) => `${row.original.completionYear}년식`,
        size: 120,
      },
      {
        accessorKey: 'recentTransaction',
        header: '최근 거래',
        cell: ({ row }) => {
          const recentTransaction = row.original.recentTransaction;
          if (!recentTransaction) return null;

          return (
            <div className="flex flex-col items-end gap-y-1">
              <div className="flex items-center gap-x-2">
                <span className="text-primary font-semibold">
                  {formatKoreanAmountText(recentTransaction.dealAmount)}
                </span>
              </div>
              <div className="flex items-center gap-x-0.5">
                <span className="text-sm text-gray-600">
                  {formatDealDate(recentTransaction.dealDate)}
                </span>
                ·
                <span className="text-sm text-gray-600">
                  {formatFloorText(recentTransaction.floor)}
                </span>
                ·
                <span className="text-sm text-gray-600">
                  {formatPyeongText(
                    calculateAreaPyeong(recentTransaction.size)
                  )}
                </span>
              </div>
            </div>
          );
        },
        size: Infinity,
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
