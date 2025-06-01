'use client';

import { useFavoriteApartList } from '@/entities/apart';
import { getSearchParams } from '@/shared/lib/searchParams';
import { TransactionPageSearchParams } from '@/shared/models/types';

import { Star } from 'lucide-react';
import { useMemo } from 'react';

import {
  ColumnDef,
  DataTable,
  DataTableColumnHeader,
  Input,
  LabelCheckbox,
  Typography,
} from '@package/ui';
import { cn } from '@package/utils';

import { useTransactionData } from '../hooks/useTransactionData';
import { useTransactionFilter } from '../hooks/useTransactionFilter';
import { useTransactionViewSetting } from '../hooks/useTransactionViewSetting';
import { TransactionItem } from '../models/types';
import { useTransactionListQuery } from '../models/useTransactionListQuery';
import { calculateApartAdditionalInfo } from '../services/calculator';
import { formatPrice, formatSizeWithPyeong } from '../services/formatter';

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

      const handleToggleFavorite = () => {
        onToggleFavorite(row.original);
      };

      return (
        <div className="flex translate-x-[1.5px] justify-center">
          <button
            onClick={handleToggleFavorite}
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
        <>
          {apartName}{' '}
          {calculateApartAdditionalInfo({
            buildedYear,
            floor,
            householdsNumber,
          })}
        </>
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
  const { regionCode } = getSearchParams<TransactionPageSearchParams>();
  const transactions = data?.list ?? [];

  const { favoriteApartList, addFavoriteApart, removeFavoriteApart } =
    useFavoriteApartList();

  const {
    searchTerm,
    isNationalSizeOnly,

    setSearchTerm,
    setIsNationalSizeOnly,
  } = useTransactionFilter(transactions);

  const filteredTransactions = useMemo(() => {
    const currentRegionFavorites = favoriteApartList.find(
      region => region.regionCode === regionCode
    );

    return transactions
      .filter(transaction => {
        const matchesSearch = transaction.apartName
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

        if (isNationalSizeOnly) {
          const matchesSize = transaction.size >= 84 && transaction.size < 85;
          return matchesSearch && matchesSize;
        }

        return matchesSearch;
      })
      .map(transaction => {
        const isFavorite =
          currentRegionFavorites?.apartItems.some(
            apartItem => apartItem.apartId === transaction.apartId
          ) || false;

        return {
          ...transaction,
          favorite: isFavorite,
        };
      });
  }, [
    transactions,
    searchTerm,
    isNationalSizeOnly,
    favoriteApartList,
    regionCode,
  ]);

  const { totalCount, averagePricePerPyeong, fullRegionName } =
    useTransactionData(filteredTransactions);

  const { sorting, pageSize, updateSorting, updatePageSize } =
    useTransactionViewSetting();

  const handleToggleFavorite = (item: TransactionItem) => {
    if (!regionCode) return;

    if (item.favorite) {
      removeFavoriteApart(regionCode, item.apartId);
    } else {
      const apartItem = {
        apartId: item.apartId,
        apartName: item.apartName,
      };
      addFavoriteApart(regionCode, apartItem);
    }
  };

  const columns = createColumns({
    onToggleFavorite: handleToggleFavorite,
  });

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
                평당 거래가격{' '}
                <span className="text-primary font-bold">
                  {formatPrice(averagePricePerPyeong)}
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
        sorting={sorting}
        pageSize={pageSize}
        onSortingChange={updateSorting}
        onPageSizeChange={updatePageSize}
      />
    </div>
  );
}
