'use client';

import {
  useTransactionListQuery,
  useTransactionPageSearchParams,
} from '@/entities/transaction';

import { useFavoriteRegion } from '../hooks/useFavoriteRegion';
import { useFilterForm } from '../hooks/useFilterForm';
import { useSearchForm } from '../hooks/useSearchForm';
import { useSearchFormAction } from '../hooks/useSearchFormAction';
import { FilterForm } from '../ui/FilterForm';
import { FormButton } from '../ui/FormButton';
import { SearchForm } from '../ui/SearchForm';

export function TransactionSearch() {
  const { setSearchParams } = useTransactionPageSearchParams();
  const { isLoading } = useTransactionListQuery();

  const { form, changeForm } = useSearchForm();
  const { filter, appliedFilter, changeFilter, removeFilter } = useFilterForm();
  const { favoriteRegionList, addFavoriteRegion, removeFavoriteRegion } =
    useFavoriteRegion();
  const { isChanged, handleSubmit } = useSearchFormAction({
    form,
    filter,
    setSearchParams,
  });

  return (
    <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
      <SearchForm
        form={form}
        favoriteRegionList={favoriteRegionList}
        onAddFavoriteRegion={addFavoriteRegion}
        onRemoveFavoriteRegion={removeFavoriteRegion}
        onChangeForm={changeForm}
      />
      <FilterForm
        filter={filter}
        appliedFilter={appliedFilter}
        onChangeFilter={changeFilter}
        onRemoveFilter={removeFilter}
      />
      <FormButton isLoading={isLoading} isChanged={isChanged} />
    </form>
  );
}
