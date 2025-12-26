import { SEARCH_PARAM_CONFIGS } from '@/entities/transaction';

import { RangeSelector } from './RangeSelector';

interface SizeRangeSelectorProps {
  minSize: number;
  maxSize: number;
  onRangeChange: (min: number, max: number) => void;
}

export function SizeRangeSelector({
  minSize,
  maxSize,
  onRangeChange,
}: SizeRangeSelectorProps) {
  const quickSelectOptions = [
    { label: '전체', min: 0, max: Infinity },
    { label: '국민평수', min: 33, max: 35 },
    { label: '10평대', min: 10, max: 19 },
    { label: '20평대', min: 20, max: 29 },
    { label: '30평대', min: 30, max: 39 },
    { label: '40평대', min: 40, max: 49 },
    { label: '50평 ~', min: 50, max: Infinity },
  ];

  const formatDisplay = (min: number, max: number) => {
    return max === Infinity
      ? min === SEARCH_PARAM_CONFIGS.SEARCH_MIN_SIZE
        ? '전체'
        : `${min}평 ~`
      : `${min}~${max}평`;
  };

  return (
    <RangeSelector
      label="평수"
      min={SEARCH_PARAM_CONFIGS.SEARCH_MIN_SIZE}
      max={SEARCH_PARAM_CONFIGS.SEARCH_MAX_SIZE}
      minValue={minSize}
      maxValue={maxSize}
      formatDisplay={formatDisplay}
      quickSelectOptions={quickSelectOptions}
      onRangeChange={onRangeChange}
    />
  );
}
