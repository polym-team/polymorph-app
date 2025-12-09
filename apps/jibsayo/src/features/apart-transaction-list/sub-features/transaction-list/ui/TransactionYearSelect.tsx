import { HorizontalScrollContainer } from '@/shared/ui/HorizontalScrollContainer';

import { Button } from '@package/ui';

interface TrasactionYearSelectProps {
  years: number[];
  yearCounts: Record<number, number>;
  onYearChange: (year: number) => void;
}

export function TrasactionYearSelect({
  years,
  yearCounts,
  onYearChange,
}: TrasactionYearSelectProps) {
  return (
    <HorizontalScrollContainer>
      <div className="flex gap-x-2">
        {years.map(year => (
          <Button
            key={year}
            size="sm"
            className="inline-flex items-center gap-x-2 lg:text-base"
            onClick={() => onYearChange(year)}
          >
            <span>{year}년</span>
            <span className="text-primary -translate-y-[1px] text-sm">
              {yearCounts[year] || 0}
            </span>
          </Button>
        ))}
      </div>
    </HorizontalScrollContainer>
  );
}
