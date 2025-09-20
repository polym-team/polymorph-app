'use client';

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';

import { useState } from 'react';

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
  onSortingChange?: (sorting: SortingState) => void;
  onRowClick?: (row: TData) => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  sorting: externalSorting,
  onSortingChange,
  onRowClick,
}: DataTableProps<TData, TValue>) {
  const [internalSorting, setInternalSorting] = useState<SortingState>([]);

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

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  });

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
              if (!columnDef.size) {
                return <col key={header.id} style={{ width: 'auto' }} />;
              } else if (typeof columnDef.size === 'number') {
                return (
                  <col
                    key={header.id}
                    style={{ width: `${columnDef.size}px` }}
                  />
                );
              }
              return <col key={header.id} />;
            })}
          </colgroup>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => {
                  return (
                    <TableHead key={header.id}>
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
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
                {row.getVisibleCells().map(cell => {
                  return (
                    <TableCell key={cell.id}>
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
    </div>
  );
}
