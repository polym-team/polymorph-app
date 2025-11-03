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
  Loader2,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

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
  data: TData[];
  sorting?: SortingState;
  pageSize?: number;
  pageIndex?: number;
  onSortingChange?: (sorting: SortingState) => void;
  onPageIndexChange?: (pageIndex: number) => void;
  onRowClick?: (row: TData) => void;
}

export function DataTable<TData, TValue>({
  loading = false,
  columns,
  data,
  sorting: externalSorting,
  pageSize = 10,
  pageIndex: externalPageIndex,
  onSortingChange,
  onRowClick,
  onPageIndexChange,
}: DataTableProps<TData, TValue>) {
  const [internalSorting, setInternalSorting] = useState<SortingState>([]);
  const [internalPageIndex, setInternalPageIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [displayData, setDisplayData] = useState(data);
  const previousDataLengthRef = useRef(data.length);

  // 외부에서 sorting이 제공되면 그것을 사용, 아니면 내부 상태 사용
  const sorting = externalSorting ?? internalSorting;
  const setSorting = (
    newSorting: SortingState | ((prev: SortingState) => SortingState)
  ) => {
    const resolvedSorting =
      typeof newSorting === 'function' ? newSorting(sorting) : newSorting;

    if (onSortingChange) {
      onSortingChange(resolvedSorting);
    } else {
      setInternalSorting(resolvedSorting);
    }
  };

  // 페이지네이션 상태 관리
  const pageIndex = externalPageIndex ?? internalPageIndex;
  const setCurrentPage = (page: number) => {
    if (onPageIndexChange) {
      onPageIndexChange(page);
    } else {
      setInternalPageIndex(page);
    }
  };

  // 데이터 변경 감지 및 애니메이션
  useEffect(() => {
    if (previousDataLengthRef.current !== data.length) {
      // 먼저 페이드 아웃
      setIsAnimating(true);

      // 페이드 아웃 후 데이터 교체 및 페이드 인
      const fadeOutTimer = setTimeout(() => {
        setDisplayData(data);
        setIsAnimating(false);
      }, 150); // 150ms 페이드 아웃 후 데이터 교체

      previousDataLengthRef.current = data.length;
      return () => clearTimeout(fadeOutTimer);
    }
  }, [data]);

  // 페이지네이션 계산
  const totalPages = Math.ceil(displayData.length / pageSize);
  const startIndex = pageIndex * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = useMemo(() => {
    const sortedData = [...displayData].sort((a, b) => {
      if (sorting.length === 0) return 0;

      const { id, desc } = sorting[0];
      const aValue = a[id as keyof TData];
      const bValue = b[id as keyof TData];

      if (aValue < bValue) return desc ? 1 : -1;
      if (aValue > bValue) return desc ? -1 : 1;
      return 0;
    });

    return sortedData.slice(startIndex, endIndex);
  }, [displayData, startIndex, endIndex, sorting]);

  const table = useReactTable({
    data: paginatedData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  });

  // 로딩 스켈레톤 컴포넌트
  const LoadingSkeleton = () => {
    // 고정된 width 배열 (리렌더링 시에도 동일한 패턴 유지)
    const skeletonWidths = ['w-[60%]', 'w-[70%]', 'w-[80%]'];

    // 각 행과 셀에 대한 고정된 width 패턴 생성
    const getSkeletonWidth = (rowIndex: number, cellIndex: number) => {
      const patternIndex =
        (rowIndex * columns.length + cellIndex) % skeletonWidths.length;
      return skeletonWidths[patternIndex];
    };

    return (
      <div className="relative w-full">
        {/* 상단 페이지네이션 스켈레톤 */}
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-x-1 text-sm text-gray-700">
            <div className="h-4 w-16 animate-pulse rounded-sm bg-gray-200" />
            <div className="h-4 w-20 animate-pulse rounded-sm bg-gray-200" />
          </div>
          <div className="flex items-center space-x-1">
            <div className="h-8 w-8 animate-pulse rounded bg-gray-200" />
            <div className="h-8 w-8 animate-pulse rounded bg-gray-200" />
            <div className="h-8 w-[52px] animate-pulse rounded bg-gray-200" />
            <div className="h-8 w-8 animate-pulse rounded bg-gray-200" />
            <div className="h-8 w-8 animate-pulse rounded bg-gray-200" />
          </div>
        </div>

        {/* 스켈레톤 테이블 */}
        <div className="overflow-x-auto">
          <Table>
            <colgroup>
              {columns.map((column, index) => {
                const columnDef = column as ExtendedColumnDef<TData, TValue>;
                if (columnDef.size === Infinity) {
                  return <col key={index} width="*" />;
                } else if (typeof columnDef.size === 'number') {
                  return <col key={index} width={columnDef.size} />;
                } else {
                  return <col key={index} />;
                }
              })}
            </colgroup>
            <TableHeader>
              <TableRow>
                {columns.map((_, index) => {
                  const isLastColumn = index === columns.length - 1;
                  return (
                    <TableHead key={index} className="overflow-hidden">
                      <div
                        className={
                          isLastColumn ? 'flex justify-end' : 'text-left'
                        }
                      >
                        <div
                          className={`h-4 ${getSkeletonWidth(0, index)} animate-pulse rounded-sm bg-gray-200 px-2`}
                        />
                      </div>
                    </TableHead>
                  );
                })}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }, (_, rowIndex) => (
                <TableRow key={rowIndex}>
                  {columns.map((_, cellIndex) => {
                    const isLastColumn = cellIndex === columns.length - 1;
                    return (
                      <TableCell
                        key={cellIndex}
                        className={isLastColumn ? 'text-right' : 'text-left'}
                      >
                        <div
                          className={`h-4 ${getSkeletonWidth(rowIndex + 1, cellIndex)} max-w-full animate-pulse rounded-sm bg-gray-200 px-2 ${
                            isLastColumn ? 'ml-auto' : ''
                          }`}
                        />
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* 하단 페이지네이션 스켈레톤 */}
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-x-1 text-sm text-gray-700">
            <div className="h-4 w-16 animate-pulse rounded-sm bg-gray-200" />
            <div className="h-4 w-20 animate-pulse rounded-sm bg-gray-200" />
          </div>
          <div className="flex items-center space-x-1">
            <div className="h-8 w-8 animate-pulse rounded bg-gray-200" />
            <div className="h-8 w-8 animate-pulse rounded bg-gray-200" />
            <div className="h-8 w-[52px] animate-pulse rounded bg-gray-200" />
            <div className="h-8 w-8 animate-pulse rounded bg-gray-200" />
            <div className="h-8 w-8 animate-pulse rounded bg-gray-200" />
          </div>
        </div>

        {/* 절대 위치 로딩 메시지 */}
        <div className="absolute inset-0 flex items-center justify-center bg-white/20">
          <div className="flex flex-col items-center gap-3 rounded border border-gray-100 bg-white/90 p-6 text-gray-600 shadow-sm">
            <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
            <span>데이터를 조회하고 있어요</span>
          </div>
        </div>
      </div>
    );
  };

  // 페이지네이션 컴포넌트
  const PaginationComponent = () => (
    <div className="flex items-center justify-between py-2">
      <div className="flex flex-wrap items-center gap-x-1 text-sm text-gray-700">
        <div>
          총{' '}
          <strong className="text-primary font-bold">
            {displayData.length}
          </strong>
          건
        </div>{' '}
        <div>
          ({startIndex + 1}-{Math.min(endIndex, displayData.length)}번째 항목)
        </div>
      </div>
      <div className="flex items-center space-x-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(0)}
          disabled={pageIndex === 0}
          className="w-8"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(pageIndex - 1)}
          disabled={pageIndex === 0}
          className="w-8"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* 페이지 선택 셀렉트박스 */}
        <Select
          value={pageIndex.toString()}
          onValueChange={value => setCurrentPage(parseInt(value))}
        >
          <SelectTrigger size="sm" className="w-[52px]">
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
          onClick={() => setCurrentPage(pageIndex + 1)}
          disabled={pageIndex === totalPages - 1}
          className="w-8"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(totalPages - 1)}
          disabled={pageIndex === totalPages - 1}
          className="w-8"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  // 로딩 상태일 때 스켈레톤 UI 표시
  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="w-full">
      {displayData.length > 0 && <PaginationComponent />}

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
                            ? 'flex translate-x-4 justify-end'
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
          <TableBody
            className={`transition-opacity duration-150 ${
              isAnimating ? 'opacity-0' : 'opacity-100'
            }`}
          >
            {displayData.length === 0 ? (
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

      {displayData.length > 0 && <PaginationComponent />}
    </div>
  );
}
