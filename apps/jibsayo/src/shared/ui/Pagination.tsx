import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';

import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@package/ui';

interface PaginationProps {
  pageIndex: number;
  totalItems: number;
  pageSize: number;
  onPageIndexChange: (pageIndex: number) => void;
}

export function Pagination({
  pageIndex,
  totalItems,
  pageSize,
  onPageIndexChange,
}: PaginationProps) {
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = pageIndex * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);

  return (
    <div className="flex items-center justify-between">
      <div>
        <span className="text-sm text-gray-500">
          <span className="text-primary">
            {startIndex + 1}-{Math.min(endIndex, totalItems)}
          </span>
          번째 항목
        </span>
      </div>
      <div className="flex items-center gap-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageIndexChange(0)}
          disabled={pageIndex === 0}
          className="w-10"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageIndexChange(pageIndex - 1)}
          disabled={pageIndex === 0}
          className="w-10"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Select
          value={pageIndex.toString()}
          onValueChange={value => onPageIndexChange(parseInt(value))}
        >
          <SelectTrigger size="sm">
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
          className="w-10"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageIndexChange(totalPages - 1)}
          disabled={pageIndex === totalPages - 1}
          className="w-10"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
