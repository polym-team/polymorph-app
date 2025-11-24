import { RULES } from '@/entities/transaction';
import { useModal } from '@/shared/hooks/useModal';
import { formatPyeong } from '@/shared/utils/formatters';

import { useRef, useState } from 'react';

import { BottomSheet, Button, Input } from '@package/ui';

import { FilterForm as FilterFormType } from '../models/types';
import { FilterLabel } from './FilterLabel';
import { SizeRangeSelector } from './SizeRangeSelector';

interface FilterFormProps {
  appliedFilter: FilterFormType;
  onApplyFilter: (filter: Partial<FilterFormType>) => void;
}

const selectedFilters = (
  filter: FilterFormType
): {
  size: boolean;
  apartName: boolean;
  favoriteOnly: boolean;
  newTransactionOnly: boolean;
} => {
  const size =
    !(filter.minSize === 0 && filter.maxSize === Infinity) &&
    (filter.minSize !== RULES.SEARCH_MIN_SIZE ||
      filter.maxSize !== RULES.SEARCH_MAX_SIZE);
  const apartName = !!filter.apartName;
  const favoriteOnly = filter.favoriteOnly;
  const newTransactionOnly = filter.newTransactionOnly;

  return { size, apartName, favoriteOnly, newTransactionOnly };
};

const calculateSelectedFilterCount = (filter: FilterFormType): number => {
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

export function FilterForm({ appliedFilter, onApplyFilter }: FilterFormProps) {
  const { isOpen, openModal, closeModal } = useModal();
  const [tempFilter, setTempFilter] = useState<FilterFormType>(appliedFilter);

  const apartNameInputRef = useRef<HTMLInputElement>(null);
  const selectedTempFilterCount = calculateSelectedFilterCount(tempFilter);
  const selectedAppliedFilterCount =
    calculateSelectedFilterCount(appliedFilter);
  const {
    size: hasSizeTempFilter,
    apartName: hasApartNameTempFilter,
    favoriteOnly: hasFavoriteOnlyTempFilter,
    newTransactionOnly: hasNewTransactionOnlyTempFilter,
  } = selectedFilters(tempFilter);

  const handleOpenBottomSheet = () => {
    setTempFilter(appliedFilter);
    openModal();
  };

  const handleApplyFilter = () => {
    onApplyFilter(tempFilter);
    closeModal();
  };

  const handleClearFilter = () => {
    onApplyFilter({
      minSize: RULES.SEARCH_MIN_SIZE,
      maxSize: RULES.SEARCH_MAX_SIZE,
      apartName: '',
      favoriteOnly: false,
      newTransactionOnly: false,
    });
    closeModal();
  };

  const handleTempFilterChange = (updates: Partial<FilterFormType>) => {
    setTempFilter(prev => ({ ...prev, ...updates }));
  };

  return (
    <div className="relative w-full">
      <Button
        onClick={handleOpenBottomSheet}
        className="w-full justify-between active:scale-100"
      >
        <span className="text-sm">세부 필터</span>
        {selectedAppliedFilterCount > 0 && (
          <span className="text-primary text-sm">
            {selectedAppliedFilterCount}개 선택됨
          </span>
        )}
      </Button>

      <BottomSheet isOpen={isOpen} onClose={closeModal}>
        <BottomSheet.Header>세부 필터</BottomSheet.Header>
        <BottomSheet.Body>
          <div className="flex flex-col gap-6">
            {selectedTempFilterCount > 0 && (
              <div>
                <span className="mb-2 block text-sm text-gray-500">
                  선택된 필터
                </span>
                <div className="mt-2 flex gap-1 overflow-x-auto">
                  {hasSizeTempFilter && (
                    <FilterLabel
                      onRemove={() =>
                        handleTempFilterChange({
                          minSize: RULES.SEARCH_MIN_SIZE,
                          maxSize: RULES.SEARCH_MAX_SIZE,
                        })
                      }
                    >
                      {tempFilter.maxSize === Infinity
                        ? `${formatPyeong(tempFilter.minSize)} 이상`
                        : `${formatPyeong(tempFilter.minSize)}~${formatPyeong(tempFilter.maxSize)}`}
                    </FilterLabel>
                  )}
                  {hasApartNameTempFilter && (
                    <FilterLabel
                      onRemove={() => {
                        handleTempFilterChange({ apartName: '' });

                        if (apartNameInputRef.current) {
                          apartNameInputRef.current.value = '';
                        }
                      }}
                    >
                      {tempFilter.apartName}
                    </FilterLabel>
                  )}
                  {hasFavoriteOnlyTempFilter && (
                    <FilterLabel
                      onRemove={() =>
                        handleTempFilterChange({ favoriteOnly: false })
                      }
                    >
                      저장된 아파트
                    </FilterLabel>
                  )}
                  {hasNewTransactionOnlyTempFilter && (
                    <FilterLabel
                      onRemove={() =>
                        handleTempFilterChange({ newTransactionOnly: false })
                      }
                    >
                      신규 거래
                    </FilterLabel>
                  )}
                </div>
              </div>
            )}

            <div>
              <SizeRangeSelector
                minSize={tempFilter.minSize}
                maxSize={tempFilter.maxSize}
                onRangeChange={(minSize, maxSize) =>
                  handleTempFilterChange({ minSize, maxSize })
                }
              />
            </div>

            <div>
              <span className="mb-2 block text-sm text-gray-500">아파트명</span>
              <Input
                ref={apartNameInputRef}
                placeholder="아파트명을 입력해주세요"
                defaultValue={tempFilter.apartName}
                onBlur={e =>
                  handleTempFilterChange({ apartName: e.target.value })
                }
              />
            </div>

            <div>
              <span className="mb-2 block text-sm text-gray-500">아파트명</span>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  rounded
                  variant={tempFilter.favoriteOnly ? 'primary' : 'outline'}
                  onClick={() =>
                    handleTempFilterChange({
                      favoriteOnly: !tempFilter.favoriteOnly,
                    })
                  }
                >
                  저장된 아파트
                </Button>
                <Button
                  size="sm"
                  rounded
                  variant={
                    tempFilter.newTransactionOnly ? 'primary' : 'outline'
                  }
                  onClick={() =>
                    handleTempFilterChange({
                      newTransactionOnly: !tempFilter.newTransactionOnly,
                    })
                  }
                >
                  신규 거래
                </Button>
              </div>
            </div>
          </div>
        </BottomSheet.Body>
        <BottomSheet.Footer>
          <div className="flex gap-x-2">
            <Button
              onClick={handleClearFilter}
              variant="outline"
              className="flex-1"
            >
              초기화
            </Button>
            <Button
              onClick={handleApplyFilter}
              variant="primary"
              className="flex-1"
            >
              필터 적용
            </Button>
          </div>
        </BottomSheet.Footer>
      </BottomSheet>
    </div>
  );
}
