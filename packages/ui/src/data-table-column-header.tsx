import { Column } from '@tanstack/react-table';

import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react';

import { cn } from '@package/utils';

import { Button } from './button';

interface DataTableColumnHeaderProps
  extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<any, unknown>;
  title: string;
}

export function DataTableColumnHeader({
  column,
  title,
  className,
}: DataTableColumnHeaderProps) {
  if (!column.getCanSort()) {
    return (
      <div className={cn(className)}>
        <span className="text-sm">{title}</span>
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Button
        size="sm"
        variant="ghost"
        className="px-0 lg:hover:bg-transparent lg:hover:font-bold"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        <span>{title}</span>
        {column.getIsSorted() === 'desc' ? (
          <ArrowDown className="ml-2 h-4 w-4" />
        ) : column.getIsSorted() === 'asc' ? (
          <ArrowUp className="ml-2 h-4 w-4" />
        ) : (
          <ChevronsUpDown className="ml-2 h-4 w-4" />
        )}
      </Button>
    </div>
  );
}
