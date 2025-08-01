'use client';

import { useFavoriteRegion } from '../hooks/useFavoriteRegion';
import { useSearchForm } from '../hooks/useSearchForm';
import { FavoriteRegionList } from './FavoriteRegionList';
import { SearchForm } from './SearchForm';

export function TransactionSearch() {
  const { form, updateCityName, updateRegionCode, updateDate, onSubmit } =
    useSearchForm();

  const { favoriteRegionList, addFavoriteRegion, removeFavoriteRegion } =
    useFavoriteRegion();

  return (
    <div className="flex flex-col gap-y-2">
      <SearchForm
        form={form}
        updateCityName={updateCityName}
        updateRegionCode={updateRegionCode}
        updateDate={updateDate}
        onSubmit={onSubmit}
        favoriteRegionList={favoriteRegionList}
        addFavoriteRegion={addFavoriteRegion}
        removeFavoriteRegion={removeFavoriteRegion}
      />
      <FavoriteRegionList
        form={form}
        onSubmit={onSubmit}
        favoriteRegionList={favoriteRegionList}
        removeFavoriteRegion={removeFavoriteRegion}
      />
    </div>
  );
}
