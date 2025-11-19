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
  const { appliedFilter, applyFilter } = useFilterForm();
  const { favoriteRegionList, addFavoriteRegion, removeFavoriteRegion } =
    useFavoriteRegion();
  const { handleSubmit } = useSearchFormAction({
    form,
    appliedFilter,
    setSearchParams,
  });

  return (
    <form
      className="flex flex-col gap-2 bg-white px-3 pb-3"
      onSubmit={handleSubmit}
    >
      <SearchForm
        form={form}
        favoriteRegionList={favoriteRegionList}
        onAddFavoriteRegion={addFavoriteRegion}
        onRemoveFavoriteRegion={removeFavoriteRegion}
        onChangeForm={changeForm}
      />
      <FilterForm appliedFilter={appliedFilter} onApplyFilter={applyFilter} />
      <FormButton isLoading={isLoading} />
    </form>
  );
}
