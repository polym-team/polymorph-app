'use client';

import { useTransactionPageSearchParams } from '@/entities/transaction';

import { useRef } from 'react';

import { useFavoriteRegion } from '../hooks/useFavoriteRegion';
import { useFilterForm } from '../hooks/useFilterForm';
import { useSearchForm } from '../hooks/useSearchForm';
import { FilterForm } from '../ui/FilterForm';
import { FormButton } from '../ui/FormButton';
import { SearchForm } from '../ui/SearchForm';

export function TransactionSearch() {
  const { setSearchParams } = useTransactionPageSearchParams();

  const { form, changeForm } = useSearchForm();
  const { filter, appliedFilter, changeFilter, removeFilter } = useFilterForm();
  const { favoriteRegionList, addFavoriteRegion, removeFavoriteRegion } =
    useFavoriteRegion();

  const beforeSearchedRegionCode = useRef<string>(form.regionCode);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const changedRegionCode =
      beforeSearchedRegionCode.current !== form.regionCode;

    setSearchParams({
      regionCode: form.regionCode,
      tradeDate: `${form.tradeDate.getFullYear()}${String(form.tradeDate.getMonth() + 1).padStart(2, '0')}`,
      apartName: changedRegionCode ? '' : filter.apartName,
      minSize: filter.minSize,
      maxSize: filter.maxSize,
      favoriteOnly: filter.favoriteOnly,
      newTransactionOnly: filter.newTransactionOnly,
      pageIndex: 0,
    });

    beforeSearchedRegionCode.current = form.regionCode;
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
      <FilterForm
        filter={filter}
        appliedFilter={appliedFilter}
        onChangeFilter={changeFilter}
        onRemoveFilter={removeFilter}
      />
      <FormButton />
    </form>
  );
}
