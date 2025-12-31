'use client';

import { SearchedApartmentItem } from '@/entities/apart';

import { useCompareAparts } from './useCompareAparts';
import { CardView } from './ui/CardView';
import { TableView } from './ui/TableView';

interface CompareApartsProps {
  selectedApartIds: number[];
  selectedSizesByApart: Map<number, [number, number][]>;
  items: SearchedApartmentItem[];
}

export function CompareAparts({
  selectedApartIds,
  selectedSizesByApart,
  items,
}: CompareApartsProps) {
  const { convertedItems, selectedItems } = useCompareAparts({
    selectedApartIds,
    selectedSizesByApart,
    items,
  });

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
