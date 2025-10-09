import { formatPyeong } from '@/shared/utils/formatters';

import { Button, Card } from '@package/ui';

import { PERIODS } from '../consts/config';
import { PeriodValue, SizesValue } from '../models/types';

interface ApartTransactionHistoryFilterProps {
  sizes: SizesValue;
  selectedPeriod: PeriodValue;
  selectedSizes: SizesValue;
  onChangePeriod: (value: PeriodValue) => void;
  onChangeSizes: (value: SizesValue) => void;
}

export function ApartTransactionHistoryFilter({
  sizes,
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
            variant={p.value === selectedPeriod ? 'primary' : 'secondary'}
            size="sm"
            className="min-w-0 flex-1 text-xs"
            onClick={() => onChangePeriod(p.value)}
          >
            {p.label}
          </Button>
        ))}
      </div>
      <hr className="my-0 border-gray-200" />
      <div className="flex gap-1 p-2">
        {Array.from(sizes).map(size => {
          const isSelected = selectedSizes.has(size);
          return (
            <Button
              key={size}
              variant={isSelected ? 'primary' : 'secondary'}
              size="xs"
              className="text-xs"
              onClick={() =>
                onChangeSizes(
                  isSelected
                    ? new Set(Array.from(selectedSizes).filter(s => s !== size))
                    : new Set(Array.from(selectedSizes).concat(size))
                )
              }
            >
              {formatPyeong(size)}
            </Button>
          );
        })}
      </div>
    </Card>
  );
}
