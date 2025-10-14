import { useMemo, useState } from 'react';

import { FilterForm, SearchForm } from '../models/types';
import { deepEqual } from '../services/compare';

interface Params {
  form: SearchForm;
  filter: FilterForm;
  setSearchParams: (params: any) => void;
}

interface Return {
  isChanged: boolean;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export const useSearchFormAction = ({
  form,
  filter,
  setSearchParams,
}: Params): Return => {
  const [searchedForm, setSearchedForm] = useState<SearchForm>(form);
  const [searchedFilter, setSearchedFilter] = useState<FilterForm>(filter);

  const isChanged = useMemo(() => {
    const isFormChanged = !deepEqual(searchedForm, form);
    const isFilterChanged = !deepEqual(searchedFilter, filter);

    return isFormChanged || isFilterChanged;
  }, [searchedForm, searchedFilter, form, filter]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const changedRegionCode = searchedForm.regionCode !== form.regionCode;

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

    setSearchedForm(form);
    setSearchedFilter(filter);
  };

  return {
    isChanged,
    handleSubmit,
  };
};
