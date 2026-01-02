import { formatQuantityText } from '@/shared/utils/formatter';

interface SummaryProps {
  cityName: string;
  regionName: string;
  totalCount: number;
  averageAmount: number;
}

export function Summary({
  cityName,
  regionName,
  totalCount,
  averageAmount,
}: SummaryProps) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:gap-x-2.5">
      <div className="flex items-center">
        <strong className="font-semibold lg:text-lg">
          {cityName} {regionName}
        </strong>
      </div>
      {totalCount > 0 && averageAmount > 0 ? (
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
      ) : (
        <div className="h-6" />
      )}
    </div>
  );
}
