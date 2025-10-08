'use client';

import { useSearchParams } from '@/entities/transaction';

import { useFavoriteRegion } from '../hooks/useFavoriteRegion';
import { useFilterForm } from '../hooks/useFilterForm';
import { useSearchForm } from '../hooks/useSearchForm';
import { FilterForm } from '../ui/FilterForm';
import { FormButton } from '../ui/FormButton';
import { SearchForm } from '../ui/SearchForm';

export function TransactionSearch() {
  const { setSearchParams } = useSearchParams();

  const { form, changeForm } = useSearchForm();
  const { filter, changeFilter } = useFilterForm();
  const { favoriteRegionList, addFavoriteRegion, removeFavoriteRegion } =
    useFavoriteRegion();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setSearchParams({
      regionCode: form.regionCode,
      tradeDate: form.tradeDate.toISOString().replace(/-/g, '').slice(0, 6),
      apartName: filter.apartName,
      minSize: filter.minSize,
      maxSize: filter.maxSize,
      favoriteOnly: filter.favoriteOnly,
      newTransactionOnly: filter.newTransactionOnly,
      pageIndex: 0,
    });
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
