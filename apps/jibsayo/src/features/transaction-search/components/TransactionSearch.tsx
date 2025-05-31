'use client';

import { useFavoriteRegion } from '../hooks/useFavoriteRegion';
import { FavoriteRegionList } from './FavoriteRegionList';
import { SearchForm } from './SearchForm';

export function TransactionSearch() {
  const { favoriteRegions, addFavoriteRegion, removeFavoriteRegion } =
    useFavoriteRegion();

  return (
    <div className="flex flex-col gap-y-2">
      <SearchForm onAddFavoriteRegion={addFavoriteRegion} />
      <FavoriteRegionList
        favoriteRegions={favoriteRegions}
        onRemoveFavoriteRegion={removeFavoriteRegion}
      />
    </div>
  );
}
