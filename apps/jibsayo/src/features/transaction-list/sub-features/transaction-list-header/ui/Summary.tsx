import { formatQuantityText } from '@/shared/utils/formatter';

interface SummaryProps {
  isLoading?: boolean;
  cityName: string;
  regionName: string;
  totalCount: number;
  averageAmount: number;
}

export function Summary({
  isLoading = false,
  cityName,
  regionName,
  totalCount,
  averageAmount,
}: SummaryProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-y-2 py-0.5 lg:flex-row lg:items-center lg:gap-x-2.5">
        <div className="h-5 w-32 animate-pulse rounded bg-gray-200 lg:h-6 lg:w-40" />
        <div className="h-4 w-48 animate-pulse rounded bg-gray-200 lg:h-5 lg:w-56" />
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:gap-x-2.5">
      <div className="flex items-center">
        <strong className="font-semibold lg:text-lg">
          {cityName} {regionName}
        </strong>
      </div>
      {totalCount > 0 && averageAmount > 0 && (
        <div>
          <span className="text-sm text-gray-500 lg:text-base">
            총{' '}
            <span className="text-primary">
              {formatQuantityText(totalCount)}
            </span>{' '}
            · 평당{' '}
            <span className="text-primary">
              {Math.round(averageAmount / 10000).toLocaleString()}
              만원
            </span>
          </span>
        </div>
      )}
    </div>
  );
}
