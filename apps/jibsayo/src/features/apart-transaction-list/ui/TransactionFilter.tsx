import { calculateAreaPyeong } from '@/entities/transaction';
import { formatPyeongText } from '@/shared/utils/formatter';

import { Button } from '@package/ui';

import { CHART_COLORS, PERIODS } from '../consts';
import { PeriodValue, SizesValue } from '../types';

interface TransactionFilterProps {
  allSizes: SizesValue;
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
    <div className="flex flex-col flex-wrap justify-between gap-x-6 gap-y-2 rounded bg-gray-100 p-2 lg:flex-row lg:items-center">
      <div className="rounded bg-white p-1">
        <div className="flex gap-x-1">
          {PERIODS.map(p => (
            <Button
              key={p.value}
              size="xs"
              className="flex-1 px-0 lg:h-auto lg:px-3 lg:py-2 lg:text-sm"
              variant={selectedPeriod === p.value ? 'primary' : 'ghost'}
              onClick={() => onChangePeriod(p.value)}
            >
              {p.label}
            </Button>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap gap-1">
        {allSizes.map((size, index) => {
          const isSelected = selectedSizes.some(
            selectedSize =>
              selectedSize[0] === size[0] && selectedSize[1] === size[1]
          );
          const minPyeong = calculateAreaPyeong(size[0]);
          const maxPyeong = calculateAreaPyeong(size[1]);

          return (
            <Button
              key={`${size[0]}-${size[1]}`}
              size="xs"
              variant="outline"
              className="lg:h-auto lg:py-2 lg:text-sm"
              style={{
                ...(isSelected && {
                  borderColor: CHART_COLORS[index % CHART_COLORS.length],
                  backgroundColor: CHART_COLORS[index % CHART_COLORS.length],
                  color: 'white',
                }),
              }}
              onClick={() =>
                onChangeSizes(
                  isSelected
                    ? selectedSizes.filter(
                        s => !(s[0] === size[0] && s[1] === size[1])
                      )
                    : [...selectedSizes, size]
                )
              }
            >
              {minPyeong !== maxPyeong ? (
                <>
                  {formatPyeongText(minPyeong)} ~ {formatPyeongText(maxPyeong)}
                </>
              ) : (
                formatPyeongText(minPyeong)
              )}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
