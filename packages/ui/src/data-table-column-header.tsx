import { Column } from '@tanstack/react-table';

import dynamic from 'next/dynamic';

import { cn } from '@package/utils';

import { Button } from './button';

interface DataTableColumnHeaderProps
  extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<any, unknown>;
  title: string;
}

const ArrowDown = dynamic(
  () => import('lucide-react').then(mod => ({ default: mod.ArrowDown })),
  {
    ssr: false,
    loading: () => <div className="ml-2 h-4 w-4" />,
  }
);

const ArrowUp = dynamic(
  () => import('lucide-react').then(mod => ({ default: mod.ArrowUp })),
  {
    ssr: false,
    loading: () => <div className="ml-2 h-4 w-4" />,
  }
);

const ChevronsUpDown = dynamic(
  () => import('lucide-react').then(mod => ({ default: mod.ChevronsUpDown })),
  {
    ssr: false,
    loading: () => <div className="ml-2 h-4 w-4" />,
  }
);

export function DataTableColumnHeader({
  column,
  title,
  className,
}: DataTableColumnHeaderProps) {
  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>;
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Button
        variant="ghost"
        size="sm"
        className="data-[state=open]:bg-accent -ml-3 h-8"
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
