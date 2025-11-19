import {
  formatKoreanAmountText,
  formatQuantity,
} from '@/shared/utils/formatters';

interface SummaryProps {
  cityName: string;
  regionName: string;
  transactionTotalCount: number;
  transactionAverageAmount: number;
}

export function Summary({
  cityName,
  regionName,
  transactionTotalCount,
  transactionAverageAmount,
}: SummaryProps) {
  return (
    <div className="flex flex-col">
      <div>
        <strong>
          {cityName} {regionName}
        </strong>
      </div>
      <div>
        <span className="text-sm text-gray-500">
          총{' '}
          <span className="text-primary">
            {formatQuantity(transactionTotalCount)}
          </span>{' '}
          · 평당{' '}
          <span className="text-primary">
            {formatKoreanAmountText(transactionAverageAmount)}
          </span>
        </span>
      </div>
    </div>
  );
}
