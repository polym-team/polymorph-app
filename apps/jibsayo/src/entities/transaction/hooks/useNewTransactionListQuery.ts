import { useQuery, UseQueryResult } from '@tanstack/react-query';

interface NewTransactionListResponse {
  count: number;
  transactionIds: string[];
}

export const useNewTransactionListQuery = (
  regionCode: string
): UseQueryResult<NewTransactionListResponse, unknown> => {
  return useQuery<NewTransactionListResponse>({
    queryKey: ['new-transactions', regionCode],
    queryFn: async () => {
      const response = await fetch(`/api/new-transactions?area=${regionCode}`);

      return response.json();
    },
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60,
    enabled: !!regionCode,
  });
};
