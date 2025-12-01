import { SEARCH_PARAM_CONFIGS } from '@/entities/transaction';
import { useModal } from '@/shared/hooks/useModal';

import { useState } from 'react';

import { FilterForm } from '../../types';
import { calculateSelectedFilterCount, selectedFilters } from './services';

interface Params {
  form: FilterForm;
  onFormChange: (value: Partial<FilterForm>) => void;
}

interface Return {
  isOpened: boolean;
  tempFilter: FilterForm;
  selectedTempFilterCount: number;
  selectedAppliedFilterCount: number;
  hasFilters: {
    size: boolean;
    apartName: boolean;
    favoriteOnly: boolean;
    newTransactionOnly: boolean;
  };
  openBottomSheet: () => void;
  closeBottomSheet: () => void;
  changeFilter: (updates: Partial<FilterForm>) => void;
  applyFilter: () => void;
  clearFilter: () => void;
}

export const useFilterForm = ({ form, onFormChange }: Params): Return => {
  const { isOpened, openModal, closeModal } = useModal();
  const [tempFilter, setTempFilter] = useState<FilterForm>(form);

  const selectedTempFilterCount = calculateSelectedFilterCount(tempFilter);
  const selectedAppliedFilterCount = calculateSelectedFilterCount(form);
  const hasFilters = selectedFilters(tempFilter);

  const openBottomSheet = () => {
    setTempFilter(form);
    openModal();
  };

  const closeBottomSheet = () => {
    closeModal();
  };

  const applyFilter = () => {
    onFormChange(tempFilter);
    closeModal();
  };

  const clearFilter = () => {
    onFormChange({
      minSize: SEARCH_PARAM_CONFIGS.SEARCH_MIN_SIZE,
      maxSize: SEARCH_PARAM_CONFIGS.SEARCH_MAX_SIZE,
      apartName: '',
      favoriteOnly: false,
      newTransactionOnly: false,
    });
    closeModal();
  };

  const changeFilter = (updates: Partial<FilterForm>) => {
    setTempFilter(prev => ({ ...prev, ...updates }));
  };

  return {
    isOpened,
    tempFilter,
    selectedTempFilterCount,
    selectedAppliedFilterCount,
    hasFilters,
    openBottomSheet,
    closeBottomSheet,
    changeFilter,
    applyFilter,
    clearFilter,
  };
};
