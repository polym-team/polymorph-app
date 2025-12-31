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
  selectedSizesByApart: Map<number, [number, number][]>;
  items: SearchedApartmentItem[];
}

export function useCompareAparts({
  selectedApartIds,
  selectedSizesByApart,
  items,
}: UseCompareApartsParams) {
  const sizesByApartRecord = useMemo(() => {
    if (selectedSizesByApart.size === 0) return undefined;

    const record: Record<number, [number, number][]> = {};
    selectedSizesByApart.forEach((sizes, apartId) => {
      record[apartId] = sizes;
    });

    return record;
  }, [selectedSizesByApart]);

  const { data } = useMonthlyTransactionsByAparts({
    apartIds: selectedApartIds,
    period: 12,
    sizesByApart: sizesByApartRecord,
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
        region: `${getCityNameWithRegionCode(item.regionCode)} ${getRegionNameWithRegionCode(item.regionCode)} ${item.dong}`,
        householdCount: item.householdCount,
        completionYear: item.completionYear,
        recentTransaction: apartData?.recentTransaction || null,
      };
    });
  }, [selectedItems, data]);

  return { convertedItems, selectedItems };
}
