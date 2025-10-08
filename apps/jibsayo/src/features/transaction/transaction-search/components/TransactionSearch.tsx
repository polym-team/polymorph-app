'use client';

import { useFavoriteRegion } from '../hooks/useFavoriteRegion';
import { useFilterForm } from '../hooks/useFilterForm';
import { useQueryParams } from '../hooks/useQueryParams';
import { useSearchForm } from '../hooks/useSearchForm';
import { FilterForm } from '../ui/FilterForm';
import { FormButton } from '../ui/FormButton';
import { SearchForm } from '../ui/SearchForm';

export function TransactionSearch() {
  const { form, changeForm } = useSearchForm();
  const { filter, changeFilter } = useFilterForm();
  const { favoriteRegionList, addFavoriteRegion, removeFavoriteRegion } =
    useFavoriteRegion();
  const { syncQueryParams, updateRegionCode } = useQueryParams({
    form,
    filter,
    changeForm,
    changeFilter,
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    syncQueryParams();
  };

  return (
    <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
      <SearchForm
        form={form}
        favoriteRegionList={favoriteRegionList}
        onAddFavoriteRegion={addFavoriteRegion}
        onRemoveFavoriteRegion={removeFavoriteRegion}
        onChangeForm={changeForm}
      />
      <FilterForm filter={filter} onChangeFilter={changeFilter} />
      <FormButton />
    </form>
  );
}
