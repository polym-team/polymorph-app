import { SEARCH_PARAM_CONFIGS } from '@/entities/transaction';

import { RangeSelector } from './RangeSelector';

interface DealAmountRangeSelectorProps {
  minDealAmount: number;
  maxDealAmount: number;
  onRangeChange: (min: number, max: number) => void;
}

export function DealAmountRangeSelector({
  minDealAmount,
  maxDealAmount,
  onRangeChange,
}: DealAmountRangeSelectorProps) {
  const quickSelectOptions = [
    { label: '전체', min: 0, max: Infinity },
    { label: '~ 5억', min: 0, max: 5 },
    { label: '5억~10억', min: 5, max: 10 },
    { label: '10억~15억', min: 10, max: 15 },
    { label: '15억~20억', min: 15, max: 20 },
    { label: '20억~30억', min: 20, max: 30 },
    { label: '30억~40억', min: 30, max: 40 },
    { label: '50억 ~', min: 50, max: Infinity },
  ];

  const formatDisplay = (min: number, max: number) => {
    return max === Infinity
      ? min === SEARCH_PARAM_CONFIGS.SEARCH_MIN_DEAL_AMOUNT
        ? '전체'
        : `${min}억원 ~`
      : `${min}억원~${max}억원`;
  };

  return (
    <RangeSelector
      label="거래가격"
      min={SEARCH_PARAM_CONFIGS.SEARCH_MIN_DEAL_AMOUNT}
      max={SEARCH_PARAM_CONFIGS.SEARCH_MAX_DEAL_AMOUNT}
      minValue={minDealAmount}
      maxValue={maxDealAmount}
      formatDisplay={formatDisplay}
      quickSelectOptions={quickSelectOptions}
      onRangeChange={onRangeChange}
    />
  );
}
