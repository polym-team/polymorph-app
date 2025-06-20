import { ROUTE_PATH } from '@/shared/consts/route';

import { Star } from 'lucide-react';
import { useRouter } from 'next/navigation';

import {
  ColumnDef,
  DataTable,
  DataTableColumnHeader,
  SortingState,
  Typography,
} from '@package/ui';
import { cn } from '@package/utils';

import { TransactionItem } from '../models/types';
import { calculateApartAdditionalInfo } from '../services/calculator';
import { formatPrice, formatSizeWithPyeong } from '../services/formatter';

interface TransactionListTableProps {
  isLoading: boolean;
  isFetched: boolean;
  data: TransactionItem[];
  sorting: SortingState;
  pageSize: number;
  pageIndex: number;
  onToggleFavorite: (item: TransactionItem) => void;
  onSortingChange: (sorting: SortingState) => void;
  onPageSizeChange: (pageSize: number) => void;
  onPageIndexChange: (pageIndex: number) => void;
  preservePageIndex?: boolean;
}

const createColumns = ({
  onToggleFavorite,
}: {
  onToggleFavorite: (item: TransactionItem) => void;
}): ColumnDef<TransactionItem>[] => [
  {
    accessorKey: 'favorite',
    header: () => <></>,
    cell: ({ row }) => {
      const isFavorite = row.getValue('favorite') as boolean;

      return (
        <div className="flex translate-x-[1.5px] justify-center">
          <button
            type="button"
            onClick={e => {
              e.preventDefault();
              e.stopPropagation();
              onToggleFavorite(row.original);
            }}
            className="h-[14px] w-[14px] transition-transform hover:scale-110"
          >
            <Star
              className={cn(
                'h-[14px] w-[14px]',
                isFavorite
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'fill-gray-300 text-gray-300'
              )}
            />
          </button>
        </div>
      );
    },
    size: 40,
  },
  {
    accessorKey: 'tradeDate',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="거래일" />
    ),
    size: 70,
  },
  {
    accessorKey: 'address',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="주소지" />
    ),
    size: 180,
  },
  {
    accessorKey: 'apartName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="아파트명" />
    ),
    cell: ({ row }) => {
      const apartName = row.getValue('apartName') as string;
      const buildedYear = row.original.buildedYear;
      const floor = row.original.floor;
      const householdsNumber = row.original.householdsNumber;
      return (
        <div className="flex items-center gap-x-1">
          {apartName}{' '}
          <Typography variant="muted">
            {calculateApartAdditionalInfo({
              buildedYear,
              floor,
              householdsNumber,
            })}
          </Typography>
        </div>
      );
    },
    size: 250,
  },
  {
    accessorKey: 'size',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="평수" />
    ),
    cell: ({ row }) => {
      const size = row.getValue('size') as number;
      return (
        <div className="flex items-center gap-x-1">
          {formatSizeWithPyeong(size)}
          <Typography variant="muted">({size}㎡)</Typography>
        </div>
      );
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

export function TransactionListTable({
  isLoading,
  isFetched,
  data,
  sorting,
  pageSize,
  pageIndex,
  onToggleFavorite,
  onSortingChange,
  onPageSizeChange,
  onPageIndexChange,
  preservePageIndex = false,
}: TransactionListTableProps) {
  const router = useRouter();
  const columns = createColumns({ onToggleFavorite });
  const mobileColumnTitles = {
    favorite: '저장',
    tradeDate: '거래일',
    address: '주소지',
    apartName: '아파트명',
    size: '평수',
    tradeAmount: '거래가격',
    isNewRecord: '신고가',
  };

  const handleClick = (row: TransactionItem) => {
    router.push(`${ROUTE_PATH.APARTS}/${encodeURIComponent(row.apartName)}`);
  };

  return (
    <DataTable
      columns={columns}
      data={data}
      loading={isLoading}
      emptyMessage={
        isFetched
          ? '검색 조건에 맞는 실거래가 데이터가 없습니다.'
          : '조건을 선택한 후 검색해주세요.'
      }
      sorting={sorting}
      pageSize={pageSize}
      page={pageIndex}
      onSortingChange={onSortingChange}
      onPageSizeChange={onPageSizeChange}
      onPageIndexChange={onPageIndexChange}
      mobileColumnTitles={mobileColumnTitles}
      preservePageIndex={preservePageIndex}
      onRowClick={handleClick}
    />
  );
}
