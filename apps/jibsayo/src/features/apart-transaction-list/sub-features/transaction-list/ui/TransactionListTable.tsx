import { ApartTransactionItem } from '@/entities/apart-transaction';
import { calculateAreaPyeong } from '@/entities/transaction';
import { NewTransactionIcon } from '@/shared/ui/NewTransactionIcon';
import {
  formatDealDate,
  formatFloorText,
  formatKoreanAmountText,
  formatPyeongText,
  formatSizeText,
} from '@/shared/utils/formatter';

import {
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronsUpDown,
} from 'lucide-react';
import React from 'react';

import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SortingState,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@package/ui';
import { cn } from '@package/utils';

import { TRANSACTION_LIST_PAGE_SIZE } from '../consts';
import { Sorting } from '../types';
import { PriceChangeRateBadge } from './PriceChangeRateBadge';

interface TransactionListTableProps {
  isFetching: boolean;
  items: ApartTransactionItem[];
  totalCount: number;
  sorting: Sorting;
  pageIndex: number;
  onSortingChange: (sorting: SortingState) => void;
  onPageIndexChange: (pageIndex: number) => void;
}

// 날짜 문자열에서 연도 추출 (YYYY-MM-DD -> YYYY년)
const getYear = (dateString: string): string => {
  const [year] = dateString.split('-');
  return `${year}년`;
};

// 날짜 문자열에서 연도 추출 (YYYY-MM-DD -> YYYY)
const getYearKey = (dateString: string): string => {
  const [year] = dateString.split('-');
  return year;
};

export function TransactionListTable({
  isFetching,
  items,
  totalCount,
  sorting,
  pageIndex,
  onSortingChange,
  onPageIndexChange,
}: TransactionListTableProps) {
  const pageSize = TRANSACTION_LIST_PAGE_SIZE;
  const totalPages = Math.ceil(totalCount / pageSize);
  const startIndex = pageIndex * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalCount);

  const handleSortingChange = (field: keyof ApartTransactionItem) => {
    const currentSort = sorting[0];
    const newSorting: Sorting = [
      {
        id: field,
        desc: currentSort.id === field ? !currentSort.desc : true,
      },
    ];
    onSortingChange(newSorting);
  };

  const getSortIcon = (field: keyof ApartTransactionItem) => {
    const currentSort = sorting[0];
    if (currentSort.id !== field) {
      return <ChevronsUpDown className="ml-2 h-4 w-4" />;
    }
    return currentSort.desc ? (
      <ArrowDown className="ml-2 h-4 w-4" />
    ) : (
      <ArrowUp className="ml-2 h-4 w-4" />
    );
  };

  return (
    <div className="w-full">
      <div className="overflow-x-auto">
        <Table>
          <colgroup>
            <col width={90} />
            <col width="*" />
            <col width={200} />
          </colgroup>
          <TableHeader>
            <TableRow>
              <TableHead className="overflow-hidden">
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="px-0 lg:hover:bg-transparent lg:hover:font-bold"
                    onClick={() => handleSortingChange('dealDate')}
                  >
                    <span>거래일</span>
                    {getSortIcon('dealDate')}
                  </Button>
                </div>
              </TableHead>
              <TableHead className="overflow-hidden">
                <span className="text-sm">층 / 평수</span>
              </TableHead>
              <TableHead className="overflow-hidden">
                <div className="flex translate-x-2 items-center justify-end gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="px-0 lg:hover:bg-transparent lg:hover:font-bold"
                    onClick={() => handleSortingChange('dealAmount')}
                  >
                    <span>거래가격</span>
                    {getSortIcon('dealAmount')}
                  </Button>
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {totalCount === 0 && (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="bg-white py-12 text-center text-gray-500"
                >
                  <div className="flex justify-center text-base">
                    표시할 데이터가 없어요
                  </div>
                </TableCell>
              </TableRow>
            )}

            {isFetching &&
              Array.from({ length: TRANSACTION_LIST_PAGE_SIZE }).map(
                (_, index) => (
                  <TableRow key={`skeleton-${index}`}>
                    <TableCell>
                      <div className="h-6 w-16 animate-pulse rounded bg-gray-200" />
                    </TableCell>
                    <TableCell>
                      <div className="h-6 w-20 animate-pulse rounded bg-gray-200" />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="ml-auto h-6 w-24 animate-pulse rounded bg-gray-200" />
                    </TableCell>
                  </TableRow>
                )
              )}

            {!isFetching &&
              totalCount > 0 &&
              items.map((item, index) => {
                const prevItem = index > 0 ? items[index - 1] : null;
                const currentYear = getYearKey(item.dealDate);
                const prevYear = prevItem
                  ? getYearKey(prevItem.dealDate)
                  : null;
                const shouldShowSeparator =
                  sorting[0].id === 'dealDate' &&
                  prevYear &&
                  currentYear !== prevYear;

                return (
                  <React.Fragment key={item.id}>
                    {shouldShowSeparator && (
                      <TableRow key={`separator-${currentYear}`}>
                        <TableCell
                          colSpan={3}
                          className="bg-gray-50 py-[2px] text-center text-xs text-gray-600 lg:text-sm"
                        >
                          {getYear(item.dealDate)}
                        </TableCell>
                      </TableRow>
                    )}
                    <TableRow>
                      <TableCell>
                        <div className="relative">
                          {item.isNewTransaction && !item.cancellationDate && (
                            <span className="absolute left-0 top-[-16px]">
                              <NewTransactionIcon />
                            </span>
                          )}
                          <span
                            className={cn(
                              'text-sm text-gray-500 lg:text-base',
                              item.cancellationDate && 'line-through'
                            )}
                          >
                            {formatDealDate(item.dealDate)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            'flex flex-wrap gap-x-1 text-sm text-gray-600 lg:text-base',
                            item.cancellationDate && 'line-through'
                          )}
                        >
                          {formatFloorText(item.floor)} /{' '}
                          <span className="inline-flex items-center gap-x-1">
                            {formatPyeongText(calculateAreaPyeong(item.size))}
                            <span className="hidden -translate-y-[1.5px] text-sm text-gray-500 lg:inline">
                              ({formatSizeText(item.size)})
                            </span>
                          </span>
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-wrap items-center justify-end gap-x-2 gap-y-1">
                          {item.changeRate !== 0 &&
                            item.prevTransaction &&
                            !item.cancellationDate && (
                              <span className="translate-x-[1px]">
                                <PriceChangeRateBadge
                                  priceChangeRate={item.changeRate}
                                  prevTransactionItem={item.prevTransaction}
                                />
                              </span>
                            )}
                          {item.cancellationDate && (
                            <span className="rounded-[6px] bg-gray-200 px-2 py-1 text-sm">
                              거래 취소
                            </span>
                          )}
                          <span
                            className={cn(
                              item.cancellationDate &&
                                'text-gray-500 line-through',
                              !item.cancellationDate && 'text-primary font-bold'
                            )}
                          >
                            {formatKoreanAmountText(item.dealAmount)}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                );
              })}
          </TableBody>
        </Table>
      </div>

      {totalCount > 0 && (
        <div className="mt-5 flex items-center justify-between">
          <div className="flex flex-wrap items-center gap-x-1 text-sm text-gray-500 lg:text-base">
            <div>
              총 <span className="text-primary">{totalCount}</span>건
            </div>{' '}
            <div>
              ({startIndex + 1}-{endIndex}
              번째 항목)
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageIndexChange(0)}
              disabled={pageIndex === 0}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageIndexChange(pageIndex - 1)}
              disabled={pageIndex === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <Select
              value={pageIndex.toString()}
              onValueChange={value => onPageIndexChange(parseInt(value))}
            >
              <SelectTrigger size="sm" className="border bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: totalPages }, (_, i) => i).map(
                  pageNumber => (
                    <SelectItem key={pageNumber} value={pageNumber.toString()}>
                      {pageNumber + 1}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageIndexChange(pageIndex + 1)}
              disabled={pageIndex === totalPages - 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageIndexChange(totalPages - 1)}
              disabled={pageIndex === totalPages - 1}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
