import { SEARCH_PARAM_CONFIGS } from '@/entities/transaction';
import { formatNumber } from '@/shared/utils/formatter';

import { RangeSelector } from './RangeSelector';

interface HouseholdCountRangeSelectorProps {
  minHouseholdCount: number;
  maxHouseholdCount: number;
  onRangeChange: (min: number, max: number) => void;
}

export function HouseholdCountRangeSelector({
  minHouseholdCount,
  maxHouseholdCount,
  onRangeChange,
}: HouseholdCountRangeSelectorProps) {
  const quickSelectOptions = [
    { label: '전체', min: 0, max: Infinity },
    { label: '~ 500세대', min: 0, max: 500 },
    { label: '500세대 ~', min: 500, max: Infinity },
    { label: '1,000세대 ~', min: 1000, max: Infinity },
    { label: '2,000세대 ~', min: 2000, max: Infinity },
    { label: '3,000세대 ~', min: 3000, max: Infinity },
    { label: '5,000세대 ~', min: 5000, max: Infinity },
  ];

  const formatDisplay = (min: number, max: number) => {
    return max === Infinity
      ? min === SEARCH_PARAM_CONFIGS.SEARCH_MIN_HOUSEHOLD_COUNT
        ? '전체'
        : `${formatNumber(min)}세대 ~`
      : `${formatNumber(min)}~${formatNumber(max)}세대`;
  };

  return (
    <RangeSelector
      label="세대수"
      min={SEARCH_PARAM_CONFIGS.SEARCH_MIN_HOUSEHOLD_COUNT}
      max={SEARCH_PARAM_CONFIGS.SEARCH_MAX_HOUSEHOLD_COUNT}
      minValue={minHouseholdCount}
      maxValue={maxHouseholdCount}
      step={100}
      formatDisplay={formatDisplay}
      quickSelectOptions={quickSelectOptions}
      onRangeChange={onRangeChange}
    />
  );
}
