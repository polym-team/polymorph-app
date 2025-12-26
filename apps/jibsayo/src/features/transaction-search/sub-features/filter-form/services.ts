import { SEARCH_PARAM_CONFIGS } from '@/entities/transaction';

import { FilterForm } from '../../types';

export const selectedFilters = (
  filter: FilterForm
): {
  dealAmount: boolean;
  householdCount: boolean;
  size: boolean;
  apartName: boolean;
  favoriteOnly: boolean;
  newTransactionOnly: boolean;
} => {
  const dealAmount =
    filter.minDealAmount !== SEARCH_PARAM_CONFIGS.SEARCH_MIN_DEAL_AMOUNT ||
    filter.maxDealAmount !== Infinity;
  const householdCount =
    filter.minHouseholdCount !==
      SEARCH_PARAM_CONFIGS.SEARCH_MIN_HOUSEHOLD_COUNT ||
    filter.maxHouseholdCount !== Infinity;
  const size =
    filter.minSize !== SEARCH_PARAM_CONFIGS.SEARCH_MIN_SIZE ||
    filter.maxSize !== Infinity;
  const apartName = !!filter.apartName;
  const favoriteOnly = filter.favoriteOnly;
  const newTransactionOnly = filter.newTransactionOnly;

  return {
    dealAmount,
    householdCount,
    size,
    apartName,
    favoriteOnly,
    newTransactionOnly,
  };
};

export const calculateSelectedFilterCount = (filter: FilterForm): number => {
  const {
    dealAmount: hasDealAmountFilter,
    householdCount: hasHouseholdCountFilter,
    size: hasSizeFilter,
    apartName: hasApartNameFilter,
    favoriteOnly: hasFavoriteOnlyFilter,
    newTransactionOnly: hasNewTransactionOnlyFilter,
  } = selectedFilters(filter);

  return [
    hasDealAmountFilter,
    hasHouseholdCountFilter,
    hasSizeFilter,
    hasApartNameFilter,
    hasFavoriteOnlyFilter,
    hasNewTransactionOnlyFilter,
  ].filter(Boolean).length;
};
