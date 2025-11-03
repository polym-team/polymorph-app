import { TransactionItem } from '@/entities/transaction/models/types';
import { useQuery, UseQueryResult } from '@tanstack/react-query';

interface NewTransactionListResponse {
  count: number;
  list: TransactionItem[];
  totalPages: number;
  processingTime: number;
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
    enabled: false, // FIXME: 신규 거래 조회 추가 필요
  });
};
