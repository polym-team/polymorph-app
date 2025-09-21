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
import { useMemo, useState } from 'react';

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

  // 페이지네이션 계산
  const totalPages = Math.ceil(data.length / pageSize);
  const startIndex = pageIndex * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = useMemo(() => {
    return data.slice(startIndex, endIndex);
  }, [data, startIndex, endIndex]);

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

  // 페이지네이션 컴포넌트
  const PaginationComponent = () => (
    <div className="flex items-center justify-between py-2">
      <div className="flex flex-wrap items-center gap-x-1 text-sm text-gray-700">
        <div>
          총 <strong className="text-primary font-bold">{data.length}</strong>건
        </div>{' '}
        <div>
          ({startIndex + 1}-{Math.min(endIndex, data.length)}번째 항목)
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

  return (
    <div className="w-full">
      {data.length > 0 && <PaginationComponent />}

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
                  return (
                    <TableHead key={header.id} className="overflow-hidden">
                      <div
                        className={
                          isLastColumn ? 'flex translate-x-4 justify-end' : ''
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
            {table.getRowModel().rows.map(row => (
              <TableRow
                key={row.id}
                className={onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}
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
            ))}
          </TableBody>
        </Table>
      </div>

      {data.length > 0 && <PaginationComponent />}
    </div>
  );
}
