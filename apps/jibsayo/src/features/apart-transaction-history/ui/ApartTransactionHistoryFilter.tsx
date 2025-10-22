import { formatPyeong } from '@/shared/utils/formatters';

import { Button, Card } from '@package/ui';

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
    <Card>
      <div className="flex gap-1 p-2">
        {PERIODS.map(p => (
          <Button
            key={p.value}
            variant={p.value === selectedPeriod ? 'primary-outline' : 'outline'}
            size="sm"
            className="min-w-0 flex-1"
            onClick={() => onChangePeriod(p.value)}
          >
            {p.label}
          </Button>
        ))}
      </div>
      <hr className="my-0 border-gray-200" />
      <div className="flex flex-wrap gap-1 p-2">
        {allSizes.map((size, index) => {
          const isSelected = selectedSizes.has(size);
          return (
            <Button
              key={size}
              size="xs"
              variant={isSelected ? 'primary-outline' : 'outline'}
              onClick={() =>
                onChangeSizes(
                  isSelected
                    ? new Set(Array.from(selectedSizes).filter(s => s !== size))
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
    </Card>
  );
}
