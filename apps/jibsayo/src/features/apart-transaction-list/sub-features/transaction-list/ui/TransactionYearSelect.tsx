import { PageIndexByYear } from '@/entities/apart-transaction/types';

import { Button } from '@package/ui';

interface TrasactionYearSelectProps {
  pageIndexes: PageIndexByYear[];
  onPageIndexChange: (year: number) => void;
}

export function TrasactionYearSelect({
  pageIndexes,
  onPageIndexChange,
}: TrasactionYearSelectProps) {
  return (
    <div className="scrollbar-hide overflow-x-auto rounded bg-gray-100 p-2">
      <div className="flex gap-x-1">
        {pageIndexes.map(({ year, count, index }) => (
          <Button
            key={year}
            size="xs"
            className="lg:h-auto lg:py-2 lg:text-sm"
            onClick={() => onPageIndexChange(index)}
          >
            <span>{year}년</span>
            <span className="text-primary">({count})</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
