import { calculateAreaPyeong } from '@/entities/transaction';
import {
  formatDealDate,
  formatFloorText,
  formatKoreanAmountText,
  formatPyeongText,
  formatSizeText,
} from '@/shared/utils/formatter';

interface PriceTooltipProps {
  variant: 'highest' | 'lowest';
  dealAmount: number;
  dealDate: string;
  size: number;
  floor: number;
}

export function PriceTooltip({
  variant,
  dealAmount,
  dealDate,
  size,
  floor,
}: PriceTooltipProps) {
  const isHighest = variant === 'highest';

  return (
    <div className="w-44 space-y-3">
      <div className="text-left text-sm font-semibold">
        {isHighest ? '직전 최고가' : '직전 5년 최저가'}
      </div>
      <div className="space-y-1 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">거래가격</span>
          <span>{formatKoreanAmountText(dealAmount)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">거래일</span>
          <span>{formatDealDate(dealDate)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">평형</span>
          <span>
            {formatPyeongText(calculateAreaPyeong(size))} (
            {formatSizeText(size)})
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">층</span>
          <span>{formatFloorText(floor)}</span>
        </div>
      </div>
    </div>
  );
}
