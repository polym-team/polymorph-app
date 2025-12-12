import { PageIndexByYear } from '@/entities/apart-transaction/types';
import { HorizontalScrollContainer } from '@/shared/ui/HorizontalScrollContainer';

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
    <HorizontalScrollContainer>
      <div className="flex gap-x-2">
        {pageIndexes.map(({ year, count, index }) => (
          <Button
            key={year}
            size="sm"
            className="inline-flex items-center gap-x-2 lg:text-base"
            onClick={() => onPageIndexChange(index)}
          >
            <span>{year}년</span>
            <span className="text-primary -translate-y-[1px] text-sm">
              {count}
            </span>
          </Button>
        ))}
      </div>
    </HorizontalScrollContainer>
  );
}
