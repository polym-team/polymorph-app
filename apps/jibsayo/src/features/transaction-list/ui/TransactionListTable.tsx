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
  newTransactionIds?: Set<string>;
  regionCode?: string;
}

const createColumns = ({
  onToggleFavorite,
  newTransactionIds,
}: {
  onToggleFavorite: (item: TransactionItem) => void;
  newTransactionIds?: Set<string>;
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
    size: 50,
  },
  {
    accessorKey: 'tradeDate',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="거래일" />
    ),
    size: 80,
  },
  {
    accessorKey: 'address',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="주소지" />
    ),
    size: 170,
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

      const isNewTransaction =
        newTransactionIds &&
        row.original.apartId &&
        newTransactionIds.has(row.original.apartId);

      return (
        <div className="flex flex-wrap items-center justify-end gap-x-1 sm:justify-normal">
          {isNewTransaction && (
            <div className="bg-primary mr-1 flex h-4 w-4 items-center justify-center rounded-full text-xs font-bold text-white">
              N
            </div>
          )}
          <span className="font-semibold sm:font-medium">{apartName}</span>{' '}
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
      const maxTradeAmount = row.getValue('maxTradeAmount') as number;

      return (
        <div className="flex flex-wrap items-center justify-end sm:justify-normal">
          <span className="text-primary font-bold">{formatPrice(amount)}</span>
          {/* 모바일에서만 최고가 표시 */}
          {maxTradeAmount && (
            <div className="flex items-center">
              <span className="mx-1 text-xs text-gray-400 sm:hidden">/</span>
              <span
                className="text-xs font-semibold text-red-600 sm:hidden"
                style={{ wordBreak: 'keep-all' }}
              >
                {formatPrice(maxTradeAmount)}
              </span>
            </div>
          )}
        </div>
      );
    },
    size: 150,
  },
  {
    accessorKey: 'maxTradeAmount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="최고가" />
    ),
    cell: ({ row }) => {
      const maxTradeAmount = row.getValue('maxTradeAmount') as number;
      if (!maxTradeAmount) return null;

      return (
        <div
          className="font-semibold text-red-600"
          style={{ wordBreak: 'keep-all' }}
        >
          {formatPrice(maxTradeAmount)}
        </div>
      );
    },
    size: 150,
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
  newTransactionIds,
  regionCode,
}: TransactionListTableProps) {
  const router = useRouter();
  const columns = createColumns({ onToggleFavorite, newTransactionIds });
  const mobileColumnTitles = {
    favorite: '즐겨찾기',
    apartName: '아파트명',
    address: '주소',
    buildedYear: '준공년도',
    householdsNumber: '세대수',
    tradeDate: '거래일자',
    size: '평수',
    tradeAmount: '거래가격/최고가',
    maxTradeAmount: '최고가',
  };

  const mobileSortableColumns = {
    tradeDate: '',
    apartName: '',
    size: '',
    tradeAmount: '거래가격',
  };

  // 정렬 컬럼용 별도 라벨 (정렬 selectbox에서만 사용)
  const mobileSortableColumnTitles = {
    tradeAmount: '거래가격',
  };

  // 모바일에서 보여줄 컬럼 순서
  const mobileColumns = [
    'favorite',
    'tradeDate',
    'apartName',
    'size',
    'tradeAmount',
  ];

  const handleClick = (row: TransactionItem) => {
    if (!regionCode) return;
    router.push(
      `${ROUTE_PATH.APARTS}/${regionCode}/${encodeURIComponent(row.apartName)}`
    );
  };

  const getRowClassName = (row: TransactionItem) => {
    const isNewTransaction =
      newTransactionIds && row.apartId && newTransactionIds.has(row.apartId);

    const isFavorite = row.favorite;

    // 신규 거래가 우선순위
    if (isNewTransaction) {
      return 'cursor-pointer !bg-primary/10 hover:!bg-primary/14';
    }

    // 즐겨찾기는 더 연한 색상
    if (isFavorite) {
      return 'cursor-pointer !bg-primary/5 hover:!bg-primary/14';
    }

    // 일반 거래
    return 'cursor-pointer hover:bg-gray-50';
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
      mobileColumns={mobileColumns}
      preservePageIndex={preservePageIndex}
      onRowClick={handleClick}
      mobileSortableColumns={mobileSortableColumns}
      mobileSortableColumnTitles={mobileSortableColumnTitles}
      getRowClassName={getRowClassName}
    />
  );
}
