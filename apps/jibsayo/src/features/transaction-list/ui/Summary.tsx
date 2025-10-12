import {
  formatKoreanAmountText,
  formatQuantity,
} from '@/shared/utils/formatters';

interface SummaryProps {
  isLoading: boolean;
  cityName: string;
  regionName: string;
  transactionTotalCount: number;
  transactionAverageAmount: number;
}

export function Summary({
  isLoading,
  cityName,
  regionName,
  transactionTotalCount,
  transactionAverageAmount,
}: SummaryProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-between">
        <div>
          <div className="h-5 w-32 animate-pulse rounded bg-gray-200"></div>
        </div>
        <div className="flex flex-col items-end space-y-1">
          <div className="h-4 w-40 animate-pulse rounded bg-gray-200"></div>
          <div className="h-4 w-36 animate-pulse rounded bg-gray-200"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between">
      <div>
        <strong>
          {cityName} {regionName}
        </strong>
      </div>
      <div className="text-right">
        <p className="text-sm text-gray-600">
          총 거래건수{' '}
          <strong className="text-primary">
            {formatQuantity(transactionTotalCount)}
          </strong>
        </p>
        <p className="text-sm text-gray-600">
          평당 거래가격{' '}
          <strong className="text-primary">
            {formatKoreanAmountText(transactionAverageAmount)}
          </strong>
        </p>
      </div>
    </div>
  );
}
