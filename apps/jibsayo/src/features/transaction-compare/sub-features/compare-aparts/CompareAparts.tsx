'use client';

import { SearchedApartmentItem } from '@/entities/apart';
import {
  getCityNameWithRegionCode,
  getRegionNameWithRegionCode,
} from '@/entities/region';
import {
  RecentTransaction,
  useMonthlyTransactionsByAparts,
} from '@/entities/transaction';

import { useMemo } from 'react';

import { CardView } from './ui/CardView';
import { TableView } from './ui/TableView';

interface CompareApartsProps {
  selectedApartIds: number[];
  items: SearchedApartmentItem[];
}

interface CompareApartData {
  id: number;
  apartName: string;
  region: string;
  householdCount: number | null;
  completionYear: number;
  recentTransaction: RecentTransaction | null;
}

export function CompareAparts({ selectedApartIds, items }: CompareApartsProps) {
  const { data } = useMonthlyTransactionsByAparts({
    apartIds: selectedApartIds,
    period: 12,
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

  if (selectedItems.length === 0) return null;

  return (
    <>
      {/* 모바일 카드 뷰 */}
      <div className="lg:hidden">
        <CardView items={convertedItems} />
      </div>

      {/* 데스크톱 테이블 뷰 */}
      <div className="hidden lg:block">
        <TableView items={convertedItems} />
      </div>
    </>
  );
}
