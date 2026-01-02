'use client';

import { SearchedApartmentItem } from '@/entities/apart';

import { CardView } from './ui/CardView';
import { TableView } from './ui/TableView';
import { useCompareAparts } from './useCompareAparts';

interface CompareApartsProps {
  selectedApartIds: number[];
  items: SearchedApartmentItem[];
  selectedPeriod: number;
  selectedSizesByApart: Map<number, [number, number][]>;
  availableSizesByApart: Map<number, [number, number][]>;
}

export function CompareAparts({
  selectedApartIds,
  items,
  selectedPeriod,
  selectedSizesByApart,
  availableSizesByApart,
}: CompareApartsProps) {
  const { convertedItems, selectedItems, isFetching } = useCompareAparts({
    selectedApartIds,
    items,
    selectedPeriod,
    selectedSizesByApart,
    availableSizesByApart,
  });

  if (selectedItems.length === 0) return null;

  return (
    <>
      {/* 모바일 카드 뷰 */}
      <div className="lg:hidden">
        <CardView items={convertedItems} loading={isFetching} />
      </div>

      {/* 데스크톱 테이블 뷰 */}
      <div className="hidden lg:block">
        <TableView items={convertedItems} loading={isFetching} />
      </div>
    </>
  );
}
