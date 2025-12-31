import { PageIndexByYear } from '@/entities/apart-transaction/types';

import { Button } from '@package/ui';

interface TrasactionYearSelectProps {
  isFetching: boolean;
  pageIndexes: PageIndexByYear[];
  onPageIndexChange: (year: number) => void;
}

export function TrasactionYearSelect({
  isFetching,
  pageIndexes,
  onPageIndexChange,
}: TrasactionYearSelectProps) {
  if (isFetching) {
    return <div className="h-[47.5px] rounded bg-gray-100" />;
  }

  if (!pageIndexes.length) {
    return null;
  }

  return (
    <div className="scrollbar-hide overflow-x-auto rounded bg-gray-100 p-2">
      <div className="flex gap-x-1">
        {pageIndexes.map(({ year, count, index }) => (
          <Button
            key={year}
            size="xs"
            className="gap-x-1 lg:h-auto lg:py-2 lg:text-sm"
            onClick={() => onPageIndexChange(index)}
          >
            <span>{year}년</span>
            <span className="text-primary -translate-y-[1px]">({count})</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
