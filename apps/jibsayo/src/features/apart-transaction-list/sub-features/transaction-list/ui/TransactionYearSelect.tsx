import { HorizontalScrollContainer } from '@/shared/ui/HorizontalScrollContainer';

import { Button } from '@package/ui';

interface TrasactionYearSelectProps {
  years: number[];
  onYearChange: (year: number) => void;
}

export function TrasactionYearSelect({
  years,
  onYearChange,
}: TrasactionYearSelectProps) {
  return (
    <HorizontalScrollContainer>
      <div className="flex gap-x-1">
        {years.map(year => (
          <Button key={year} size="sm" onClick={() => onYearChange(year)}>
            {year}년
          </Button>
        ))}
      </div>
    </HorizontalScrollContainer>
  );
}
