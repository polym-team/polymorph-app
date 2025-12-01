import { SummaryState } from '@/features/transaction-list/types';
import {
  formatKoreanAmountText,
  formatQuantityText,
} from '@/shared/utils/formatter';

interface SummaryProps {
  isLoading: boolean;
  cityName: string;
  regionName: string;
  summary: SummaryState;
}

export function Summary({
  isLoading,
  cityName,
  regionName,
  summary,
}: SummaryProps) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:gap-x-2.5">
      <div className="flex items-center">
        <strong className="font-semibold lg:text-lg">
          {cityName} {regionName}
        </strong>
      </div>
      <div>
        {isLoading && (
          <div className="flex py-1">
            <div className="h-4 w-48 animate-pulse rounded bg-gray-200 lg:h-5 lg:w-56" />
          </div>
        )}
        {!isLoading && (
          <span className="text-sm text-gray-500 lg:text-base">
            총{' '}
            <span className="text-primary">
              {formatQuantityText(summary.transactionTotalCount)}
            </span>{' '}
            · 평당{' '}
            <span className="text-primary">
              {formatKoreanAmountText(summary.transactionAverageAmount)}
            </span>
          </span>
        )}
      </div>
    </div>
  );
}
