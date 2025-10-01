import {
  formatKoreanAmountText,
  formatQuantity,
} from '@/shared/utils/formatters';

interface TransactionSummaryProps {
  cityName: string;
  regionName: string;
  transactionTotalCount: number;
  transactionAverageAmount: number;
}

export function TransactionSummary({
  cityName,
  regionName,
  transactionTotalCount,
  transactionAverageAmount,
}: TransactionSummaryProps) {
  const isShowSummary = Boolean(cityName && regionName);

  if (!isShowSummary) {
    return null;
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
          총 거래 건수{' '}
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
