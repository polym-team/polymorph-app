'use client';

import { EmptyList } from './ui/EmptyList';
import { RegionItem } from './ui/RegionItem';
import { RegionTabs } from './ui/RegionTabs';
import { useFavoriteApartList } from './useFavoriteApartList';

export function FavoriteApartList() {
  const {
    regionTabs,
    selectedRegionCode,
    regionItems,
    toggleFavoriteApart,
    clickApartItem,
    isApartLoading,
    setSelectedRegionCode,
  } = useFavoriteApartList();

  if (!regionTabs.length) {
    return <EmptyList />;
  }

  return (
    <div className="flex w-full flex-col gap-y-3 py-2">
      <RegionTabs
        tabs={regionTabs}
        activeTab={selectedRegionCode}
        onTabChange={setSelectedRegionCode}
      />

      {regionItems.map(item => (
        <RegionItem
          key={item.code}
          item={item}
          isLoading={isApartLoading}
          onToggleFavorite={toggleFavoriteApart}
          onClickApart={clickApartItem}
        />
      ))}
    </div>
  );
}
