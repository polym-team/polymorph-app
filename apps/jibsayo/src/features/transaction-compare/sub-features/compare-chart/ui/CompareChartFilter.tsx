import { Button } from '@package/ui';

import { PERIODS } from '../consts';
import { PeriodValue } from '../types';

interface CompareChartFilterProps {
  selectedPeriod: PeriodValue;
  onChangePeriod: (value: PeriodValue) => void;
}

export function CompareChartFilter({
  selectedPeriod,
  onChangePeriod,
}: CompareChartFilterProps) {
  return (
    <div className="flex flex-col gap-y-2 lg:flex-row lg:items-center lg:justify-between">
      <span className="text-sm text-gray-500">실거래가 비교</span>
      <div className="flex gap-x-1 rounded bg-gray-100 p-1">
        {PERIODS.map(p => (
          <Button
            key={p.value}
            size="sm"
            className="flex-1 px-0 lg:px-3"
            variant={selectedPeriod === p.value ? 'primary' : 'ghost'}
            onClick={() => onChangePeriod(p.value as PeriodValue)}
          >
            {p.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
