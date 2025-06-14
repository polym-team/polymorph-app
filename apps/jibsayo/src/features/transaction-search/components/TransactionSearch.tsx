'use client';

import { useFavoriteRegion } from '../hooks/useFavoriteRegion';
import { useSearchForm } from '../hooks/useSearchForm';
import { FavoriteRegionList } from './FavoriteRegionList';
import { SearchForm } from './SearchForm';

export function TransactionSearch() {
  const { form, updateCityName, updateRegionCode, updateDate, onSubmit } =
    useSearchForm();

  return (
    <div className="flex flex-col gap-y-2">
      <SearchForm
        form={form}
        updateCityName={updateCityName}
        updateRegionCode={updateRegionCode}
        updateDate={updateDate}
        onSubmit={onSubmit}
      />
      <FavoriteRegionList form={form} onSubmit={onSubmit} />
    </div>
  );
}
