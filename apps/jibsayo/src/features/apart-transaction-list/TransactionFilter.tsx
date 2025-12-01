import { formatPyeongText } from '@/shared/utils/formatter';

import { Button } from '@package/ui';
import { cn } from '@package/utils';

import { CHART_COLORS, PERIODS } from './consts';
import { PeriodValue, SizesValue } from './types';

interface TransactionFilterProps {
  allSizes: number[];
  selectedPeriod: PeriodValue;
  selectedSizes: SizesValue;
  onChangePeriod: (value: PeriodValue) => void;
  onChangeSizes: (value: SizesValue) => void;
}

export function TransactionFilter({
  allSizes,
  selectedPeriod,
  selectedSizes,
  onChangePeriod,
  onChangeSizes,
}: TransactionFilterProps) {
  return (
    <div className="flex flex-col gap-y-3 lg:rounded lg:bg-gray-100 lg:p-3">
      <div className="flex gap-x-1 rounded bg-gray-100 p-1.5 lg:justify-start lg:bg-transparent lg:p-0">
        {PERIODS.map(p => (
          <button
            key={p.value}
            className={cn(
              'w-full rounded border py-2 text-sm transition-all duration-200 active:bg-gray-200 lg:w-auto lg:px-5 lg:py-3 lg:text-base',
              selectedPeriod !== p.value &&
                'border-gray-100 lg:hover:bg-gray-200',
              selectedPeriod === p.value &&
                'text-primary border-gray-200 bg-white active:bg-white'
            )}
            onClick={() => onChangePeriod(p.value)}
          >
            {p.label}
          </button>
        ))}
      </div>
      <hr className="hidden lg:block" />
      <div className="relative">
        <div className="scrollbar-hide flex gap-1 overflow-x-auto overflow-y-hidden pr-8">
          {allSizes.map((size, index) => {
            const isSelected = selectedSizes.has(size);
            return (
              <Button
                key={size}
                size="sm"
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
                {formatPyeongText(size)}
              </Button>
            );
          })}
        </div>
        <div className="pointer-events-none absolute right-0 top-0 h-full w-12 bg-gradient-to-l from-white to-transparent lg:hidden" />
      </div>
    </div>
  );
}
