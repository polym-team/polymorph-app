import { keepPreviousData, useQuery } from '@tanstack/react-query';

interface Params {
  apartName: string;
}

export interface SearchedApartmentItem {
  id: number;
  apartName: string;
  householdCount: number | null;
  completionYear: number;
  regionCode: string;
  dong: string;
}

const fetchApartmentsByName = async (
  apartName: string
): Promise<SearchedApartmentItem[]> => {
  if (!apartName.trim()) {
    return [];
  }

  const MIN_DELAY = 300;
  const [response] = await Promise.all([
    fetch(`/api/apartments/by-name/${encodeURIComponent(apartName)}`),
    new Promise(resolve => setTimeout(resolve, MIN_DELAY)),
  ]);

  if (!response.ok) {
    throw new Error('Failed to fetch apartments by name');
  }

  return response.json();
};

export const useApartSearchQuery = (params: Params) => {
  return useQuery({
    queryKey: ['apartmentSearch', params.apartName],
    queryFn: () => fetchApartmentsByName(params.apartName),
    placeholderData: keepPreviousData,
    enabled: params.apartName.trim().length > 0,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
};

export type { SearchedApartmentItem as ApartmentListItem };
