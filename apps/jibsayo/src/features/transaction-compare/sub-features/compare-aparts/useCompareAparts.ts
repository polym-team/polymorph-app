import { SearchedApartmentItem } from '@/entities/apart';
import {
  getCityNameWithRegionCode,
  getRegionNameWithRegionCode,
} from '@/entities/region';
import { useMonthlyTransactionsByAparts } from '@/entities/transaction';
import { useDebounce } from '@/shared/hooks/useDebounce';

import { useMemo } from 'react';

import { CompareApartData } from './types';

interface UseCompareApartsParams {
  selectedApartIds: number[];
  items: SearchedApartmentItem[];
  selectedPeriod: number;
  selectedSizesByApart: Map<number, [number, number][]>;
  availableSizesByApart: Map<number, [number, number][]>;
}

export function useCompareAparts({
  selectedApartIds,
  items,
  selectedPeriod,
  selectedSizesByApart,
  availableSizesByApart,
}: UseCompareApartsParams) {
  const sizesByApartRecord = useMemo(() => {
    if (selectedSizesByApart.size === 0) return undefined;

    // 모든 아파트의 availableSizes가 로드되었는지 확인
    const allApartsHaveAvailableSizes = selectedApartIds.every(apartId =>
      availableSizesByApart.has(apartId)
    );

    // availableSizes가 로드되지 않은 아파트가 있으면 sizes 필터링 없이 조회
    if (!allApartsHaveAvailableSizes) {
      return undefined;
    }

    // 모든 평형이 선택되었는지 확인
    let allSizesSelected = true;
    for (const apartId of selectedApartIds) {
      const availableSizes = availableSizesByApart.get(apartId) || [];
      const selectedSizes = selectedSizesByApart.get(apartId) || [];

      if (availableSizes.length !== selectedSizes.length) {
        allSizesSelected = false;
        break;
      }
    }

    // 모든 평형이 선택된 경우 sizes를 전달하지 않음 (전체 데이터 조회)
    if (allSizesSelected) {
      return undefined;
    }

    const record: Record<number, [number, number][]> = {};
    selectedSizesByApart.forEach((sizes, apartId) => {
      record[apartId] = sizes;
    });

    return record;
  }, [selectedSizesByApart, availableSizesByApart, selectedApartIds]);

  // 파라미터를 debounce 처리 (500ms)
  const debouncedPeriod = useDebounce(selectedPeriod, 500);
  const debouncedSizesByApart = useDebounce(sizesByApartRecord, 500);

  const { data, isFetching } = useMonthlyTransactionsByAparts({
    apartIds: selectedApartIds,
    period: debouncedPeriod,
    sizesByApart: debouncedSizesByApart,
  });

  const selectedItems = items.filter(item =>
    selectedApartIds.includes(item.id)
  );

  const convertedItems = useMemo<CompareApartData[]>(() => {
    const dataArray = Array.isArray(data) ? data : [];
    return selectedItems.map(item => {
      const apartData = dataArray.find(apart => apart.apartId === item.id);
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
