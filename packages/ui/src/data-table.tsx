'use client';

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import React from 'react';

import { Button } from './button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './table';

// 확장된 ColumnDef 타입
type ExtendedColumnDef<TData, TValue> = ColumnDef<TData, TValue> & {
  size?: number | '*';
};

interface DataTableProps<TData, TValue> {
  loading?: boolean;
  columns: ExtendedColumnDef<TData, TValue>[];
  data: TData[]; // 이미 페이지네이션과 소팅이 적용된 데이터
  sorting: SortingState;
  pageSize?: number;
  pageIndex: number;
  totalItems: number; // 전체 데이터 개수
  onSortingChange: (sorting: SortingState) => void;
  onPageIndexChange: (pageIndex: number) => void;
  onRowClick?: (row: TData) => void;
}

export function DataTable<TData, TValue>({
  loading = false,
  columns,
  data,
  sorting,
  pageSize = 10,
  pageIndex,
  totalItems,
  onSortingChange,
  onRowClick,
  onPageIndexChange,
}: DataTableProps<TData, TValue>) {
  // 페이지네이션 계산 (외부 데이터 기준)
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = pageIndex * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);

  const setSorting = (
    newSorting: SortingState | ((prev: SortingState) => SortingState)
  ) => {
    const resolvedSorting =
      typeof newSorting === 'function' ? newSorting(sorting) : newSorting;
    onSortingChange(resolvedSorting);
  };

  const table = useReactTable({
    data, // 외부에서 이미 페이지네이션과 소팅이 적용된 데이터
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  });

  // Body 스켈레톤 컴포넌트
  const LoadingTableBody = () => {
    const skeletonWidths = [
      'w-[70%]',
      'w-[75%]',
      'w-[80%]',
      'w-[85%]',
      'w-[90%]',
      'w-[95%]',
      'w-[100%]',
    ];

    const getSkeletonWidth = (rowIndex: number, cellIndex: number) => {
      const patternIndex =
        (rowIndex * columns.length + cellIndex) % skeletonWidths.length;
      return skeletonWidths[patternIndex];
    };

    return (
      <>
        {Array.from({ length: pageSize }, (_, rowIndex) => (
          <TableRow key={rowIndex}>
            {columns.map((_, cellIndex) => {
              const isLastColumn = cellIndex === columns.length - 1;
              return (
                <TableCell
                  key={cellIndex}
                  className={isLastColumn ? 'text-right' : 'text-left'}
                >
                  <div className="py-1">
                    <div
                      className={`h-4 ${getSkeletonWidth(rowIndex, cellIndex)} max-w-full animate-pulse rounded-sm bg-gray-200 px-2 ${
                        isLastColumn ? 'ml-auto' : ''
                      }`}
                    />
                  </div>
                </TableCell>
              );
            })}
          </TableRow>
        ))}
      </>
    );
  };

  // 페이지네이션 컴포넌트
  const PaginationComponent = () => (
    <div
      className={`mt-5 flex items-center justify-between ${loading ? 'pointer-events-none opacity-50' : ''}`}
    >
      <div className="flex flex-wrap items-center gap-x-1 text-sm text-gray-500 lg:text-base">
        <div>
          총 <span className="text-primary">{totalItems}</span>건
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

        {/* 페이지 선택 셀렉트박스 */}
        <Select
          value={pageIndex.toString()}
          onValueChange={value => onPageIndexChange(parseInt(value))}
          disabled={loading}
        >
          <SelectTrigger size="sm" className="border bg-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: totalPages }, (_, i) => i).map(pageNumber => (
              <SelectItem key={pageNumber} value={pageNumber.toString()}>
                {pageNumber + 1}
              </SelectItem>
            ))}
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
  );

  return (
    <div className="w-full">
      <div className="overflow-x-auto">
        <Table>
          <colgroup>
            {table.getHeaderGroups()[0]?.headers.map(header => {
              const columnDef = header.column.columnDef as ExtendedColumnDef<
                TData,
                TValue
              >;

              if (columnDef.size === Infinity) {
                return <col key={header.id} width="*" />;
              } else if (typeof columnDef.size === 'number') {
                return <col key={header.id} width={columnDef.size} />;
              } else {
                return <col key={header.id} />;
              }
            })}
          </colgroup>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header, index) => {
                  const isLastColumn = index === headerGroup.headers.length - 1;
                  const isSortable = header.column.getCanSort();
                  return (
                    <TableHead key={header.id} className="overflow-hidden">
                      <div
                        className={
                          isLastColumn && isSortable
                            ? 'flex translate-x-2 justify-end'
                            : isLastColumn
                              ? 'flex justify-end'
                              : ''
                        }
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                      </div>
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              <LoadingTableBody />
            ) : totalItems === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="bg-white py-12 text-center text-gray-500"
                >
                  <div className="flex justify-center text-base">
                    표시할 데이터가 없어요
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map(row => (
                <TableRow
                  key={row.id}
                  className={
                    onRowClick
                      ? 'cursor-pointer transition-all duration-200 hover:bg-gray-50 active:brightness-90'
                      : ''
                  }
                  onClick={() => onRowClick?.(row.original)}
                >
                  {row.getVisibleCells().map((cell, index) => {
                    const isLastColumn =
                      index === row.getVisibleCells().length - 1;
                    return (
                      <TableCell
                        key={cell.id}
                        className={isLastColumn ? 'text-right' : ''}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalItems > 0 && <PaginationComponent />}
    </div>
  );
}
