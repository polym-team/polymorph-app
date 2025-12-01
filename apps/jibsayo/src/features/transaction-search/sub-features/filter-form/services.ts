import { SEARCH_PARAM_CONFIGS } from '@/entities/transaction';

import { FilterForm } from '../../types';

export const selectedFilters = (
  filter: FilterForm
): {
  size: boolean;
  apartName: boolean;
  favoriteOnly: boolean;
  newTransactionOnly: boolean;
} => {
  const size =
    !(filter.minSize === 0 && filter.maxSize === Infinity) &&
    (filter.minSize !== SEARCH_PARAM_CONFIGS.SEARCH_MIN_SIZE ||
      filter.maxSize !== SEARCH_PARAM_CONFIGS.SEARCH_MAX_SIZE);
  const apartName = !!filter.apartName;
  const favoriteOnly = filter.favoriteOnly;
  const newTransactionOnly = filter.newTransactionOnly;

  return { size, apartName, favoriteOnly, newTransactionOnly };
};

export const calculateSelectedFilterCount = (filter: FilterForm): number => {
  const {
    size: hasSizeFilter,
    apartName: hasApartNameFilter,
    favoriteOnly: hasFavoriteOnlyFilter,
    newTransactionOnly: hasNewTransactionOnlyFilter,
  } = selectedFilters(filter);

  return [
    hasSizeFilter,
    hasApartNameFilter,
    hasFavoriteOnlyFilter,
    hasNewTransactionOnlyFilter,
  ].filter(Boolean).length;
};
