import { SearchedApartmentItem } from '@/entities/apart';
import {
  getCityNameWithRegionCode,
  getRegionNameWithRegionCode,
} from '@/entities/region';
import { useMonthlyTransactionsByAparts } from '@/entities/transaction';

import { useMemo } from 'react';

import { CompareApartData } from './types';

interface UseCompareApartsParams {
  selectedApartIds: number[];
  items: SearchedApartmentItem[];
  selectedPeriod: number;
}

export function useCompareAparts({
  selectedApartIds,
  items,
  selectedPeriod,
}: UseCompareApartsParams) {
  const { data, isFetching } = useMonthlyTransactionsByAparts({
    apartIds: selectedApartIds,
    period: selectedPeriod,
  });

  const selectedItems = items.filter(item =>
    selectedApartIds.includes(item.id)
  );

  const convertedItems = useMemo<CompareApartData[]>(() => {
    return selectedItems.map(item => {
      const apartData = data?.find(apart => apart.apartId === item.id);
      return {
        id: item.id,
        apartName: item.apartName,
        region: `${getCityNameWithRegionCode(item.regionCode)} ${getRegionNameWithRegionCode(item.regionCode)} ${apartData?.dong || item.dong}`,
        householdCount: apartData?.householdCount ?? item.householdCount,
        completionYear: apartData?.completionYear ?? item.completionYear,
        recentTransaction: apartData?.recentTransaction || null,
      };
    });
  }, [selectedItems, data]);

  return { convertedItems, selectedItems, isFetching };
}
