import {
  getCityNameWithRegionCode,
  getRegionNameWithRegionCode,
} from '@/entities/region';
import {
  useTransactionListQuery,
  useTransactionPageSearchParams,
} from '@/entities/transaction';

import { calculateTransactionAverageAmount } from '../services/calculator';
import { Summary } from '../ui/Summary';

export function TransactionSummary() {
  const { isLoading, data: transactions } = useTransactionListQuery();
  const { searchParams } = useTransactionPageSearchParams();

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
    <Summary
      isLoading={isLoading}
      cityName={cityName}
      regionName={regionName}
      transactionTotalCount={transactionTotalCount}
      transactionAverageAmount={transactionAverageAmount}
    />
  );
}
