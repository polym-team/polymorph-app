import { SEARCH_PARAM_CONFIGS } from '@/entities/transaction';
import { formatPyeongText } from '@/shared/utils/formatter';

import { useRef } from 'react';

import { BottomSheet, Button, Input } from '@package/ui';

import { FilterForm as FilterFormType } from '../../types';
import { DealAmountRangeSelector } from './ui/DealAmountRangeSelector';
import { FilterButton } from './ui/FilterButton';
import { HouseholdCountRangeSelector } from './ui/HouseholdCountRangeSelector';
import { SizeRangeSelector } from './ui/SizeRangeSelector';
import { useFilterForm } from './useFilterForm';

interface FilterFormProps {
  form: FilterFormType;
  onFormChange: (value: Partial<FilterFormType>) => void;
}

export function FilterForm({ form, onFormChange }: FilterFormProps) {
  const apartNameInputRef = useRef<HTMLInputElement>(null);

  const {
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
  } = useFilterForm({
    form,
    onFormChange,
  });

  return (
    <div className="relative w-full">
      <Button
        onClick={openBottomSheet}
        className="flex w-full items-center justify-between active:scale-100"
      >
        <span className="text-sm lg:text-base">세부 필터</span>
        {selectedAppliedFilterCount === 0 && (
          <span className="text-sm text-gray-400">미선택</span>
        )}
        {selectedAppliedFilterCount > 0 && (
          <span className="text-primary text-sm">
            {selectedAppliedFilterCount}개 선택됨
          </span>
        )}
      </Button>

      <BottomSheet isOpen={isOpened} size="sm" onClose={closeBottomSheet}>
        <BottomSheet.Header>세부 필터</BottomSheet.Header>
        {selectedTempFilterCount > 0 && (
          <BottomSheet.Body className="border-b border-gray-100">
            <span className="mb-2 block text-sm text-gray-600 lg:text-base">
              선택된 필터{' '}
              <span className="text-primary">{selectedTempFilterCount}</span>
            </span>
            <div className="mt-2 flex gap-2 overflow-x-auto">
              {hasFilters.newTransactionOnly && (
                <FilterButton
                  onRemove={() => changeFilter({ newTransactionOnly: false })}
                >
                  신규 거래만 보기
                </FilterButton>
              )}
              {hasFilters.favoriteOnly && (
                <FilterButton
                  onRemove={() => changeFilter({ favoriteOnly: false })}
                >
                  저장된 아파트만 보기
                </FilterButton>
              )}
              {hasFilters.apartName && (
                <FilterButton
                  onRemove={() => {
                    changeFilter({ apartName: '' });

                    if (apartNameInputRef.current) {
                      apartNameInputRef.current.value = '';
                    }
                  }}
                >
                  {tempFilter.apartName}
                </FilterButton>
              )}
              {hasFilters.dealAmount && (
                <FilterButton
                  onRemove={() =>
                    changeFilter({
                      minDealAmount:
                        SEARCH_PARAM_CONFIGS.SEARCH_MIN_DEAL_AMOUNT,
                      maxDealAmount: Infinity,
                    })
                  }
                >
                  {tempFilter.maxDealAmount === Infinity
                    ? `${tempFilter.minDealAmount}억원 이상`
                    : `${tempFilter.minDealAmount}억원~${tempFilter.maxDealAmount}억원`}
                </FilterButton>
              )}
              {hasFilters.householdCount && (
                <FilterButton
                  onRemove={() =>
                    changeFilter({
                      minHouseholdCount:
                        SEARCH_PARAM_CONFIGS.SEARCH_MIN_HOUSEHOLD_COUNT,
                      maxHouseholdCount: Infinity,
                    })
                  }
                >
                  {tempFilter.maxHouseholdCount === Infinity
                    ? `${tempFilter.minHouseholdCount}세대 이상`
                    : `${tempFilter.minHouseholdCount}~${tempFilter.maxHouseholdCount}세대`}
                </FilterButton>
              )}
              {hasFilters.size && (
                <FilterButton
                  onRemove={() =>
                    changeFilter({
                      minSize: SEARCH_PARAM_CONFIGS.SEARCH_MIN_SIZE,
                      maxSize: Infinity,
                    })
                  }
                >
                  {tempFilter.maxSize === Infinity
                    ? `${formatPyeongText(tempFilter.minSize)} 이상`
                    : `${formatPyeongText(tempFilter.minSize)}~${formatPyeongText(tempFilter.maxSize)}`}
                </FilterButton>
              )}
            </div>
          </BottomSheet.Body>
        )}
        <BottomSheet.Body className="h-[60vh]">
          <div className="flex flex-col gap-y-5">
            <div>
              <span className="mb-2 block text-sm text-gray-500 lg:text-base">
                보기 옵션
              </span>
              <div className="flex gap-x-1">
                <Button
                  size="sm"
                  rounded
                  variant={
                    tempFilter.newTransactionOnly ? 'primary-light' : 'outline'
                  }
                  onClick={() =>
                    changeFilter({
                      newTransactionOnly: !tempFilter.newTransactionOnly,
                    })
                  }
                >
                  신규 거래만 보기
                </Button>
                <Button
                  size="sm"
                  rounded
                  variant={
                    tempFilter.favoriteOnly ? 'primary-light' : 'outline'
                  }
                  onClick={() =>
                    changeFilter({
                      favoriteOnly: !tempFilter.favoriteOnly,
                    })
                  }
                >
                  저장된 아파트만 보기
                </Button>
              </div>
            </div>

            <div>
              <span className="mb-2 block text-sm text-gray-500 lg:text-base">
                아파트명
              </span>
              <Input
                ref={apartNameInputRef}
                placeholder="아파트명을 입력해주세요"
                defaultValue={tempFilter.apartName}
                onBlur={e => changeFilter({ apartName: e.target.value })}
              />
            </div>

            <div>
              <DealAmountRangeSelector
                minDealAmount={tempFilter.minDealAmount}
                maxDealAmount={tempFilter.maxDealAmount}
                onRangeChange={(minDealAmount, maxDealAmount) =>
                  changeFilter({ minDealAmount, maxDealAmount })
                }
              />
            </div>

            <div>
              <HouseholdCountRangeSelector
                minHouseholdCount={tempFilter.minHouseholdCount}
                maxHouseholdCount={tempFilter.maxHouseholdCount}
                onRangeChange={(minHouseholdCount, maxHouseholdCount) =>
                  changeFilter({ minHouseholdCount, maxHouseholdCount })
                }
              />
            </div>

            <div>
              <SizeRangeSelector
                minSize={tempFilter.minSize}
                maxSize={tempFilter.maxSize}
                onRangeChange={(minSize, maxSize) =>
                  changeFilter({ minSize, maxSize })
                }
              />
            </div>
          </div>
        </BottomSheet.Body>
        <BottomSheet.Footer>
          <div className="flex gap-x-2 lg:justify-end">
            <Button
              onClick={clearFilter}
              variant="outline"
              className="w-1/2 lg:w-auto"
            >
              필터 삭제
            </Button>
            <Button
              onClick={applyFilter}
              variant="primary"
              className="w-1/2 lg:w-auto"
            >
              필터 적용
            </Button>
          </div>
        </BottomSheet.Footer>
      </BottomSheet>
    </div>
  );
}
