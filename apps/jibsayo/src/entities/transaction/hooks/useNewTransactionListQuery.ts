import { useQuery, UseQueryResult } from '@tanstack/react-query';

interface NewTransactionListResponse {
  count: number;
  transactionIds: string[];
}

const getTodayDate = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');

  return `${year}${month}${day}`;
};

export const useNewTransactionListQuery = (
  regionCode: string
): UseQueryResult<NewTransactionListResponse, unknown> => {
  const date = getTodayDate();

  return useQuery<NewTransactionListResponse>({
    queryKey: ['new-transactions', regionCode, date],
    queryFn: async () => {
      const response = await fetch(
        `/api/new-transactions?area=${regionCode}&date=${date}`
      );

      return response.json();
    },
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60,
    enabled: !!regionCode,
  });
};
