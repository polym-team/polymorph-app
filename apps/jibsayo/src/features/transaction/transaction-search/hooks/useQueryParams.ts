import { useSearchParams } from '@/entities/transaction';

import { FilterForm, SearchForm } from '../models/types';

interface Props {
  form: SearchForm;
  filter: FilterForm;
  changeForm: (form: Partial<SearchForm>) => void;
  changeFilter: (filter: Partial<FilterForm>) => void;
}

interface Return {
  syncQueryParams: () => void;
  updateRegionCode: (regionCode: string) => void;
}

export const useQueryParams = ({ form, filter, changeForm }: Props): Return => {
  const { setSearchParams } = useSearchParams();

  const syncQueryParams = () => {
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

  const updateRegionCode = (regionCode: string) => {
    changeForm({ regionCode });
    setSearchParams({ regionCode });
  };

  return { syncQueryParams, updateRegionCode };
};
