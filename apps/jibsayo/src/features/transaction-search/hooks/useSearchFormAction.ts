import { useState } from 'react';

import { FilterForm, SearchForm } from '../models/types';

interface Params {
  form: SearchForm;
  appliedFilter: FilterForm;
  setSearchParams: (params: any) => void;
}

interface Return {
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export const useSearchFormAction = ({
  form,
  appliedFilter,
  setSearchParams,
}: Params): Return => {
  const [searchedForm, setSearchedForm] = useState<SearchForm>(form);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const changedRegionCode = searchedForm.regionCode !== form.regionCode;

    setSearchParams({
      regionCode: form.regionCode,
      tradeDate: `${form.tradeDate.getFullYear()}${String(form.tradeDate.getMonth() + 1).padStart(2, '0')}`,
      apartName: changedRegionCode ? '' : appliedFilter.apartName,
      minSize: appliedFilter.minSize,
      maxSize: appliedFilter.maxSize,
      favoriteOnly: appliedFilter.favoriteOnly,
      newTransactionOnly: appliedFilter.newTransactionOnly,
      pageIndex: 0,
    });

    setSearchedForm(form);
  };

  return { handleSubmit };
};
