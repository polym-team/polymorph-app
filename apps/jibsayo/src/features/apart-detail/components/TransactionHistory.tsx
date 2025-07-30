'use client';

import { ApartDetailResponse } from '@/app/api/apart/types';
import { useNewTransactionListQuery } from '@/entities/transaction/hooks/useNewTransactionListQuery';
import { formatPrice } from '@/features/transaction-list/services/formatter';
import { formatSizeWithPyeong } from '@/features/transaction-list/services/formatter';
import { TransactionItem } from '@/shared/models/types';

import { Info as LucideInfo } from 'lucide-react';
import { useMemo, useState } from 'react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@package/ui';
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
import { calculatePyeong } from '../services/calculator';

interface Props {
  items: ApartDetailResponse['tradeItems'];
  regionCode?: string;
}

const createColumns = ({
  newTransactionIds,
}: {
  newTransactionIds?: Set<string>;
}): ColumnDef<TransactionItem>[] => [
  {
    accessorKey: 'tradeDate',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="거래일" />
    ),
    cell: ({ row }) => {
      const tradeDate = row.getValue('tradeDate') as string;
      const tradeAmount = row.original.tradeAmount;
      const size = row.original.size;
      const transactionKey = `${tradeDate}_${tradeAmount}_${size}`;
      const isNewTransaction =
        newTransactionIds && newTransactionIds.has(transactionKey);

      return (
        <div className="flex items-center gap-x-1">
          {isNewTransaction && (
            <div className="bg-primary mr-1 flex h-4 w-4 items-center justify-center rounded-full text-xs font-bold text-white">
              N
            </div>
          )}
          <div>{tradeDate}</div>
        </div>
      );
    },
    size: 100,
  },
  {
    accessorKey: 'size',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="면적/평수" />
    ),
    cell: ({ row }) => {
      const size = row.getValue('size') as number;
      const pyeong = row.original.pyeong;
      const floor = row.original.floor;

      // 모바일에서는 층/평수/면적을 묶어서 표시
      return (
        <div className="flex items-center gap-x-1">
          <div className="hidden sm:flex sm:items-center sm:gap-x-1">
            <div>{pyeong}평</div>
            <div className="text-sm text-gray-500">({size}㎡)</div>
          </div>
          <div className="sm:hidden">
            {floor}층/{pyeong}평({size}㎡)
          </div>
        </div>
      );
    },
    size: 120,
  },
  {
    accessorKey: 'floor',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="층" />
    ),
    cell: ({ row }) => (
      <div className="hidden sm:block">{row.getValue('floor')}층</div>
    ),
    size: 100,
  },
  {
    accessorKey: 'tradeAmount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="거래가격" />
    ),
    cell: ({ row }) => {
      const amount = row.getValue('tradeAmount') as number;
      const pricePerPyeong = row.original.pricePerPyeong;

      return (
        <div className="flex items-center gap-x-1">
          <div className="text-primary font-bold">{formatPrice(amount)}</div>
          <div className="text-sm text-gray-500 sm:hidden">
            (평당 {formatPrice(pricePerPyeong)})
          </div>
        </div>
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
      const pricePerPyeong = row.original.pricePerPyeong;
      return (
        <div className="hidden text-sm text-gray-600 sm:block">
          {formatPrice(pricePerPyeong)}
        </div>
      );
    },
    size: 150,
  },
  {
    accessorKey: 'priceChange',
    header: () => (
      <div>
        가격변동
        <HoverCard openDelay={0} closeDelay={0}>
          <HoverCardTrigger asChild>
            <div className="ml-1 inline-block translate-y-[2px]">
              <LucideInfo className="text-primary h-4 w-4 cursor-help" />
            </div>
          </HoverCardTrigger>
          <HoverCardContent className="w-80">
            <p className="text-sm font-light">같은 평수 기준 변동 실거래가</p>
          </HoverCardContent>
        </HoverCard>
      </div>
    ),
    cell: ({ row }) => {
      const priceChange = row.original.priceChange;
      if (!priceChange || !Number(priceChange.change)) return '-';

      return (
        <div className="flex items-center gap-x-1">
          <div
            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
              priceChange.isUp
                ? 'bg-red-100 text-red-700'
                : priceChange.isDown
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-700'
            }`}
          >
            {priceChange.isUp ? '↗' : '↘'}{' '}
            {Math.abs(Number(priceChange.change))}%
          </div>
        </div>
      );
    },
    size: 60,
  },
];

const mobileColumnTitles = {
  tradeDate: '거래일',
  size: '층/평수(면적)',
  floor: '층/평수(면적)',
  tradeAmount: '거래가격',
  pricePerPyeong: '거래가격',
  priceChange: '가격변동',
};

// 정렬 컬럼용 별도 라벨 (정렬 selectbox에서만 사용)
const mobileSortableColumnTitles = {
  tradeDate: '거래일',
  size: '평수',
  tradeAmount: '거래가격',
};

// 정렬 가능한 컬럼 제한
const mobileSortableColumns = {
  tradeDate: '',
  size: '',
  tradeAmount: '',
};

export function TransactionHistory({ items, regionCode }: Props) {
  const [selectedSize, setSelectedSize] = useState<string>('all');
  const { processedItems, sorting, setSorting, pageSize, setPageSize } =
    useTransactionHistory(items);

  // 신규 거래건 조회 (일별 신규 거래)
  const { data: newTransactionData } = useNewTransactionListQuery({
    area: regionCode,
  });

  // 신규 거래건 판단 (오늘 등록된 거래의 개별 거래건 ID 기준)
  const newTransactionIds = useMemo(() => {
    const newTransactions = newTransactionData?.list ?? [];
    return new Set(
      newTransactions.map(
        (transaction: any) =>
          `${transaction.tradeDate}_${transaction.tradeAmount}_${transaction.size}`
      )
    );
  }, [newTransactionData?.list]);

  // 평형 옵션 생성
  const sizeOptions = useMemo(() => {
    const sizes = new Set(processedItems.map(item => item.size));
    const sizeGroups = Array.from(sizes).reduce(
      (acc, size) => {
        const pyeong = calculatePyeong(size); // 평수 소수점 버림
        if (!acc[pyeong]) {
          acc[pyeong] = [];
        }
        acc[pyeong].push(size);
        return acc;
      },
      {} as Record<number, number[]>
    );

    return [
      { value: 'all', label: '전체' },
      ...Object.entries(sizeGroups)
        .sort(([a], [b]) => Number(a) - Number(b))
        .map(([pyeong, sizes]) => ({
          value: sizes.join(','),
          label: `${pyeong}평 (${sizes.map(size => `${size}㎡`).join(', ')})`,
        })),
    ];
  }, [processedItems]);

  // 평형 필터링
  const filteredItems = useMemo(() => {
    if (selectedSize === 'all') return processedItems;
    const selectedSizes = selectedSize.split(',').map(Number);
    return processedItems.filter(item => selectedSizes.includes(item.size));
  }, [processedItems, selectedSize]);

  // 신규거래 하이라이팅을 위한 행 클래스명 생성 함수
  const getRowClassName = (row: TransactionItem) => {
    const transactionKey = `${row.tradeDate}_${row.tradeAmount}_${row.size}`;
    const isNewTransaction =
      newTransactionIds && newTransactionIds.has(transactionKey);

    if (isNewTransaction) {
      return '!bg-primary/10 hover:!bg-primary/14';
    }

    return 'hover:bg-gray-50';
  };

  if (!items || items.length === 0) {
    return null;
  }

  const columns = createColumns({ newTransactionIds });

  return (
    <Card className="p-3 md:p-5">
      <div className="mb-5 flex items-center justify-between">
        <Typography variant="large" className="font-semibold">
          거래 내역{' '}
          <strong className="text-primary text-base">
            ({filteredItems.length}건)
          </strong>
        </Typography>
        <Select value={selectedSize} onValueChange={setSelectedSize}>
          <SelectTrigger className="h-8 w-[120px] text-sm">
            <SelectValue placeholder="평형 선택" />
          </SelectTrigger>
          <SelectContent>
            {sizeOptions.map(option => (
              <SelectItem
                key={option.value}
                value={option.value}
                className="text-sm"
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={filteredItems}
        sorting={sorting}
        onSortingChange={setSorting}
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
        mobileColumnTitles={mobileColumnTitles}
        mobileColumns={['tradeDate', 'size', 'tradeAmount', 'priceChange']}
        mobileSortableColumns={mobileSortableColumns}
        mobileSortableColumnTitles={mobileSortableColumnTitles}
        emptyMessage="거래 내역이 없습니다."
        showPagination={true}
        getRowClassName={getRowClassName}
      />
    </Card>
  );
}

export default TransactionHistory;
