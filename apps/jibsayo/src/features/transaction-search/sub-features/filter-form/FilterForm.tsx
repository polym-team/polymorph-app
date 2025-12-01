import { SEARCH_PARAM_CONFIGS } from '@/entities/transaction';
import { formatPyeongText } from '@/shared/utils/formatter';

import { useRef } from 'react';

import { BottomSheet, Button, Input } from '@package/ui';

import { FilterForm as FilterFormType } from '../../types';
import { FilterButton } from './ui/FilterButton';
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
        <BottomSheet.Body>
          <div className="flex flex-col gap-y-6">
            {selectedTempFilterCount > 0 && (
              <div>
                <span className="mb-2 block text-sm text-gray-500 lg:text-base">
                  선택된 필터{' '}
                  <span className="text-primary">
                    {selectedTempFilterCount}
                  </span>
                </span>
                <div className="mt-2 flex gap-1 overflow-x-auto">
                  {hasFilters.size && (
                    <FilterButton
                      onRemove={() =>
                        changeFilter({
                          minSize: SEARCH_PARAM_CONFIGS.SEARCH_MIN_SIZE,
                          maxSize: SEARCH_PARAM_CONFIGS.SEARCH_MAX_SIZE,
                        })
                      }
                    >
                      {tempFilter.maxSize === Infinity
                        ? `${formatPyeongText(tempFilter.minSize)} 이상`
                        : `${formatPyeongText(tempFilter.minSize)}~${formatPyeongText(tempFilter.maxSize)}`}
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
                  {hasFilters.favoriteOnly && (
                    <FilterButton
                      onRemove={() => changeFilter({ favoriteOnly: false })}
                    >
                      저장된 아파트
                    </FilterButton>
                  )}
                  {hasFilters.newTransactionOnly && (
                    <FilterButton
                      onRemove={() =>
                        changeFilter({ newTransactionOnly: false })
                      }
                    >
                      신규 거래
                    </FilterButton>
                  )}
                </div>
              </div>
            )}

            <div>
              <SizeRangeSelector
                minSize={tempFilter.minSize}
                maxSize={tempFilter.maxSize}
                onRangeChange={(minSize, maxSize) =>
                  changeFilter({ minSize, maxSize })
                }
              />
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
              <span className="mb-2 block text-sm text-gray-500 lg:text-base">
                추가 필터
              </span>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  rounded
                  variant={tempFilter.favoriteOnly ? 'primary' : 'outline'}
                  onClick={() =>
                    changeFilter({
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
                    changeFilter({
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
          <div className="flex gap-x-2 lg:justify-end">
            <Button
              onClick={clearFilter}
              variant="outline"
              className="w-1/2 lg:w-auto"
            >
              초기화
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
