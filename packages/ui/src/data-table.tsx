'use client';

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';

import {
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  SearchX,
} from 'lucide-react';
import { useEffect, useState } from 'react';

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

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  emptyMessage?: string;
  pageSize?: number;
  showPagination?: boolean;
  sorting?: SortingState;
  onSortingChange?: (sorting: SortingState) => void;
  onPageSizeChange?: (pageSize: number) => void;
  mobileColumnTitles?: Record<string, string>;
  loading?: boolean;
  loadingMessage?: string;
  preservePageIndex?: boolean;
  onRowClick?: (row: TData) => void;
  page?: number;
  onPageIndexChange?: (pageIndex: number) => void;
}

function useIsClient() {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);
  return isClient;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  emptyMessage = '조회된 데이터가 없습니다.',
  pageSize = 10,
  showPagination = true,
  sorting: externalSorting,
  onSortingChange,
  onPageSizeChange,
  mobileColumnTitles,
  loading = false,
  preservePageIndex = false,
  loadingMessage = '데이터를 불러오고 있어요.',
  onRowClick,
  page: externalPage,
  onPageIndexChange,
}: DataTableProps<TData, TValue>) {
  const [internalSorting, setInternalSorting] = useState<SortingState>([]);
  const [internalPage, setInternalPage] = useState(0);
  const isClient = useIsClient();

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

  // 외부에서 page가 제공되면 그것을 사용, 아니면 내부 상태 사용
  const page = externalPage ?? internalPage;
  const setPage = (newPage: number) => {
    if (onPageIndexChange) {
      onPageIndexChange(newPage);
    } else {
      setInternalPage(newPage);
    }
  };

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    autoResetPageIndex: !preservePageIndex,
    state: {
      sorting,
      pagination: {
        pageIndex: page,
        pageSize,
      },
    },
    onPaginationChange: updater => {
      if (typeof updater === 'function') {
        const newState = updater({
          pageIndex: page,
          pageSize,
        });
        setPage(newState.pageIndex);
      } else {
        setPage(updater.pageIndex);
      }
    },
    enableColumnResizing: false,
    columnResizeMode: 'onChange',
  });

  // pageSize prop이 변경될 때마다 테이블의 페이지 크기 업데이트
  useEffect(() => {
    if (table.getState().pagination.pageSize !== pageSize) {
      table.setPageSize(pageSize);
    }
  }, [pageSize, table]);

  const handlePageSizeChange = (newPageSize: string) => {
    const size = Number(newPageSize);
    table.setPageSize(size);
    onPageSizeChange?.(size);
  };

  // 기본 정렬 컬럼 값 (SSR 호환)
  const defaultSortColumn = isClient
    ? table.getState().sorting[0]?.id ||
      table.getAllColumns().find(col => col.getCanSort())?.id ||
      ''
    : '';

  const showLoading = loading || !isClient;

  return (
    <div className="w-full space-y-4">
      {/* 데스크톱 테이블 뷰 */}
      <div className="hidden overflow-x-auto sm:block">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => {
                  return (
                    <TableHead
                      key={header.id}
                      style={{ width: header.getSize() }}
                    >
                      {
                        flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        ) as any
                      }
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {showLoading ? (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={columns.length}
                  className="h-[120px] text-center"
                >
                  <div className="flex flex-col items-center gap-5">
                    <div className="border-primary h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" />
                    <span className="text-gray-500">{loadingMessage}</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className={
                    onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''
                  }
                  onClick={() => onRowClick?.(row.original)}
                >
                  {row.getVisibleCells().map(cell => (
                    <TableCell
                      key={cell.id}
                      style={{ width: cell.column.getSize() }}
                    >
                      {
                        flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        ) as any
                      }
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={columns.length}
                  className="h-[120px] text-center"
                >
                  <div className="flex flex-col items-center gap-2">
                    <SearchX className="h-6 w-6 text-gray-400" />
                    <span className="text-gray-500">{emptyMessage}</span>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* 모바일 카드 리스트 뷰 */}
      <div className="space-y-2 sm:hidden">
        {/* 모바일 정렬 UI */}
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <Select
              value={defaultSortColumn}
              onValueChange={value => {
                const currentSort = table.getState().sorting[0];
                const currentDesc = currentSort?.desc || false;
                const newSorting = [{ id: value, desc: currentDesc }];
                setSorting(newSorting);
              }}
            >
              <SelectTrigger className="h-8 w-full text-sm">
                <SelectValue placeholder="정렬 컬럼" />
              </SelectTrigger>
              <SelectContent>
                {isClient &&
                  table
                    .getAllColumns()
                    .filter(
                      column => column.getCanSort() && column.id !== 'favorite'
                    )
                    .map(column => {
                      const header = column.columnDef.header;
                      let displayName = '';

                      // mobileColumnTitles에서 우선 찾기
                      if (mobileColumnTitles && mobileColumnTitles[column.id]) {
                        displayName = mobileColumnTitles[column.id];
                      }
                      // 문자열 헤더인 경우
                      else if (typeof header === 'string') {
                        displayName = header;
                      }
                      // columnDef.id 또는 accessorKey 사용
                      else {
                        displayName = column.id;
                      }

                      return (
                        <SelectItem key={column.id} value={column.id}>
                          {displayName}
                        </SelectItem>
                      );
                    })}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1">
            <Select
              value={
                isClient
                  ? table.getState().sorting[0]?.desc
                    ? 'desc'
                    : 'asc'
                  : ''
              }
              onValueChange={value => {
                const currentSort = table.getState().sorting[0];
                const currentId =
                  currentSort?.id ||
                  table.getAllColumns().find(col => col.getCanSort())?.id ||
                  '';
                const newSorting = [{ id: currentId, desc: value === 'desc' }];
                setSorting(newSorting);
              }}
            >
              <SelectTrigger className="h-8 w-full text-sm">
                <SelectValue placeholder="정렬 순서" />
              </SelectTrigger>
              <SelectContent>
                {isClient && (
                  <>
                    <SelectItem value="desc">
                      <div className="flex items-center gap-2">
                        내림차순
                        <ArrowDown className="h-4 w-4" />
                      </div>
                    </SelectItem>
                    <SelectItem value="asc">
                      <div className="flex items-center gap-2">
                        오름차순
                        <ArrowUp className="h-4 w-4" />
                      </div>
                    </SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        {showLoading ? (
          // 스켈레톤 UI - 3개 카드 생성
          Array.from({ length: 3 }, (_, index) => (
            <div
              key={index}
              className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm"
            >
              <div className="space-y-2">
                {Array.from({ length: columns.length }, (_, colIndex) => (
                  <div
                    key={colIndex}
                    className="flex items-start justify-between"
                  >
                    <div className="h-3 w-16 animate-pulse rounded bg-gray-200"></div>
                    <div className="h-3 w-24 animate-pulse rounded bg-gray-200"></div>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map(row => (
            <div
              key={row.id}
              className={`rounded-lg border border-gray-200 bg-white p-3 shadow-sm ${
                onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''
              }`}
              onClick={() => onRowClick?.(row.original)}
            >
              {row.getVisibleCells().map((cell, index) => {
                const header = table.getHeaderGroups()[0]?.headers[index];
                let headerText = '';

                if (header) {
                  const accessorKey = header.column.id;

                  // mobileColumnTitles에서 우선 찾기
                  if (mobileColumnTitles && mobileColumnTitles[accessorKey]) {
                    headerText = mobileColumnTitles[accessorKey];
                  }
                  // 문자열 헤더인 경우
                  else if (typeof header.column.columnDef.header === 'string') {
                    headerText = header.column.columnDef.header;
                  }
                }

                return (
                  <div
                    key={cell.id}
                    className="flex items-center justify-between py-1 first:pt-0 last:pb-0"
                  >
                    <span className="mr-3 flex-shrink-0 text-sm font-medium text-gray-500">
                      {headerText}
                    </span>
                    <div className="text-right text-sm">
                      {
                        flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        ) as any
                      }
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        ) : (
          <div className="rounded border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col items-center justify-center gap-2 text-center">
              <SearchX className="h-5 w-5 text-gray-500" />
              <span className="text-sm text-gray-500">{emptyMessage}</span>
            </div>
          </div>
        )}
      </div>

      {showPagination && !showLoading && data.length > 0 && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:px-2">
          <div className="hidden justify-center sm:flex sm:flex-1 sm:justify-start">
            <div className="rounded-full bg-gray-50">
              <span className="text-xs font-medium text-gray-700 sm:text-sm">
                총{' '}
                <span className="text-primary font-bold">
                  {table.getFilteredRowModel().rows.length}
                </span>
                건 중{' '}
                <span className="text-primary font-bold">
                  {table.getState().pagination.pageIndex *
                    table.getState().pagination.pageSize +
                    1}
                  -
                  {Math.min(
                    (table.getState().pagination.pageIndex + 1) *
                      table.getState().pagination.pageSize,
                    table.getFilteredRowModel().rows.length
                  )}
                </span>{' '}
                번째 항목
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-x-3">
            <div className="flex items-center gap-2 rounded-lg bg-gray-50">
              <Select
                value={table.getState().pagination.pageSize.toString()}
                onValueChange={handlePageSizeChange}
              >
                <SelectTrigger className="h-8 w-[120px] text-sm">
                  <SelectValue>
                    페이지당 {table.getState().pagination.pageSize}개
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {[10, 20, 30, 40, 50].map(pageSize => (
                    <SelectItem key={pageSize} value={pageSize.toString()}>
                      {pageSize}개
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-3">
              <div className="border-input rounded border bg-white px-3 py-1 pb-[5px] text-sm">
                <strong className="text-primary">
                  {table.getState().pagination.pageIndex + 1}
                </strong>{' '}
                / {table.getPageCount()}
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  className="hover:bg-primary/10 h-8 w-8 p-0"
                  onClick={() => table.setPageIndex(0)}
                  disabled={!table.getCanPreviousPage()}
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="hover:bg-primary/10 h-8 w-8 p-0"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="hover:bg-primary/10 h-8 w-8 p-0"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="hover:bg-primary/10 h-8 w-8 p-0"
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                  disabled={!table.getCanNextPage()}
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
