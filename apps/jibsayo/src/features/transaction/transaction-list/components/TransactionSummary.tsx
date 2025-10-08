import {
  getCityNameWithRegionCode,
  getRegionNameWithRegionCode,
} from '@/entities/region';
import {
  useSearchParams,
  useTransactionListQuery,
} from '@/entities/transaction';
import {
  formatKoreanAmountText,
  formatQuantity,
} from '@/shared/utils/formatters';

import { calculateTransactionAverageAmount } from '../services/calculator';

export function TransactionSummary() {
  const { data: transactions } = useTransactionListQuery();
  const { searchParams } = useSearchParams();

  const cityName = getCityNameWithRegionCode(searchParams.regionCode);
  const regionName = getRegionNameWithRegionCode(searchParams.regionCode);
  const transactionTotalCount = transactions?.list?.length ?? 0;
  const transactionAverageAmount = calculateTransactionAverageAmount(
    transactions?.list ?? []
  );

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
