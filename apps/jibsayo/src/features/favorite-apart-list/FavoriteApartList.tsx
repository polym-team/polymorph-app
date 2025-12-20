'use client';

import { EmptyList } from './ui/EmptyList';
import { RegionItem } from './ui/RegionItem';
import { Skeleton } from './ui/Skeleton';
import { useFavoriteApartList } from './useFavoriteApartList';

export function FavoriteApartList() {
  const { regionItems, toggleFavoriteApart, clickApartItem, isLoading } =
    useFavoriteApartList();

  if (isLoading) {
    return <Skeleton />;
  }

  if (!regionItems.length) {
    return <EmptyList />;
  }

  return (
    <div className="flex w-full flex-col gap-y-3 pb-10">
      {regionItems.map(item => (
        <RegionItem
          key={item.code}
          item={item}
          onToggleFavorite={toggleFavoriteApart}
          onClickApart={clickApartItem}
        />
      ))}
    </div>
  );
}
