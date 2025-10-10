import { TransactionItem } from '@/entities/transaction/models/types';
import { useQuery } from '@tanstack/react-query';

interface NewTransactionListResponse {
  count: number;
  list: TransactionItem[];
  totalPages: number;
  processingTime: number;
}

interface UseNewTransactionListQueryParams {
  area?: string;
}

export function useNewTransactionListQuery(
  params?: UseNewTransactionListQueryParams
) {
  const { area } = params || {};

  return useQuery<NewTransactionListResponse>({
    queryKey: ['new-transactions', { area }],
    queryFn: async () => {
      if (!area) {
        return { count: 0, list: [], totalPages: 0, processingTime: 0 };
      }

      const searchParams = new URLSearchParams({
        area,
      });

      const response = await fetch(
        `/api/new-transactions?${searchParams.toString()}`
      );

      if (!response.ok) {
        throw new Error('신규 거래건 조회에 실패했습니다.');
      }

      return response.json();
    },
    enabled: !!area,
    staleTime: 1000 * 60 * 60, // 1시간 (transactions와 동일)
    gcTime: 1000 * 60 * 60, // 1시간 (transactions와 동일)
  });
}
