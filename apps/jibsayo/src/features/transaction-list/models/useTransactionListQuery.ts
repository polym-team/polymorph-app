import { useQuery } from '@tanstack/react-query';

import { useSearchParams } from 'next/navigation';

export const useTransactionListQuery = () => {
  const searchParams = useSearchParams();
  const regionCode = searchParams.get('regionCode');
  const tradeDate = searchParams.get('tradeDate');

  return useQuery({
    queryKey: ['transaction-list'],
    enabled: !!regionCode && !!tradeDate,
    queryFn: async () =>
      (
        await fetch(
          `/api/transactions?area=${regionCode}&createDt=${tradeDate}`
        )
      ).json(),
  });
};
