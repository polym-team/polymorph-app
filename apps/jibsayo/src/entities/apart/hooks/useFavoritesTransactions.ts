import { useQuery } from '@tanstack/react-query';

interface TransactionItem {
  id: number;
  dealDate: string;
  size: number;
  floor: number;
  dealAmount: number;
}

interface ApartmentTransactionSummary {
  apartId: number;
  hasNewTransaction: boolean;
  latestTransaction: TransactionItem | null;
  highestPriceTransaction: TransactionItem | null;
  lowestPriceTransaction: TransactionItem | null;
}

interface TransactionsByFavoritesResponse {
  results: ApartmentTransactionSummary[];
}

const fetchFavoritesTransactions = async (
  apartIds: number[]
): Promise<TransactionsByFavoritesResponse> => {
  if (apartIds.length === 0) {
    return { results: [] };
  }

  const apartIdsParam = apartIds.join(',');
  const response = await fetch(
    `/api/transactions/by-favorites/${apartIdsParam}`
  );

  if (!response.ok) {
    throw new Error('Failed to fetch favorites transactions');
  }

  return response.json();
};

export const useFavoritesTransactions = (apartIds: number[]) => {
  return useQuery({
    queryKey: ['favoritesTransactions', apartIds],
    queryFn: () => fetchFavoritesTransactions(apartIds),
    enabled: apartIds.length > 0,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
};

export type { TransactionItem, ApartmentTransactionSummary };
