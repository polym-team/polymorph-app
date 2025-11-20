import { formatPyeong } from '@/shared/utils/formatters';

import { Button } from '@package/ui';
import { cn } from '@package/utils';

import { CHART_COLORS, PERIODS } from '../consts/config';
import { PeriodValue, SizesValue } from '../models/types';

interface ApartTransactionHistoryFilterProps {
  allSizes: number[];
  selectedPeriod: PeriodValue;
  selectedSizes: SizesValue;
  onChangePeriod: (value: PeriodValue) => void;
  onChangeSizes: (value: SizesValue) => void;
}

export function ApartTransactionHistoryFilter({
  allSizes,
  selectedPeriod,
  selectedSizes,
  onChangePeriod,
  onChangeSizes,
}: ApartTransactionHistoryFilterProps) {
  return (
    <div className="flex flex-col gap-y-2">
      <div className="flex rounded bg-gray-100 p-1">
        {PERIODS.map(p => (
          <button
            key={p.value}
            className={cn(
              'w-full rounded py-2 text-sm transition-all duration-200',
              selectedPeriod === p.value && 'bg-white'
            )}
            onClick={() => onChangePeriod(p.value)}
          >
            {p.label}
          </button>
        ))}
      </div>
      <div className="relative">
        <div className="scrollbar-hide flex gap-1 overflow-x-auto overflow-y-hidden pr-8">
          {allSizes.map((size, index) => {
            const isSelected = selectedSizes.has(size);
            return (
              <Button
                key={size}
                size="xs"
                rounded
                variant={isSelected ? 'primary-light' : 'default'}
                onClick={() =>
                  onChangeSizes(
                    isSelected
                      ? new Set(
                          Array.from(selectedSizes).filter(s => s !== size)
                        )
                      : new Set(Array.from(selectedSizes).concat(size))
                  )
                }
              >
                <span
                  className="block h-2 w-2 rounded-sm"
                  style={{
                    backgroundColor: CHART_COLORS[index % CHART_COLORS.length],
                  }}
                />
                {formatPyeong(size)}
              </Button>
            );
          })}
        </div>
        <div className="pointer-events-none absolute right-0 top-0 h-full w-12 bg-gradient-to-l from-white to-transparent" />
      </div>
    </div>
  );
}
