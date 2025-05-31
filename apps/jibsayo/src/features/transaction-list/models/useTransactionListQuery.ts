import { useQuery } from '@tanstack/react-query';

import { useSearchParams } from 'next/navigation';

export const useTransactionListQuery = () => {
  const searchParams = useSearchParams();
  const regionCode = searchParams.get('regionCode');
  const tradeDate = searchParams.get('tradeDate');

  return useQuery({
    queryKey: ['transaction-list', regionCode, tradeDate],
    enabled: !!regionCode && !!tradeDate,
    staleTime: 1000 * 60 * 60 * 24,
    gcTime: 1000 * 60 * 60 * 24,
    queryFn: async () =>
      (
        await fetch(
          `/api/transactions?area=${regionCode}&createDt=${tradeDate}`
        )
      ).json(),
  });
};
