import { RULES } from '@/entities/transaction';
import { formatPyeong } from '@/shared/utils/formatters';

import { useState } from 'react';

import { BottomSheet, Button, Input, Typography } from '@package/ui';

import { FilterForm as FilterFormType } from '../models/types';
import { FilterLabel } from './FilterLabel';
import { SizeRangeSelector } from './SizeRangeSelector';

interface FilterFormProps {
  filter: FilterFormType;
  appliedFilter: FilterFormType;
  onChangeFilter: (filter: Partial<FilterFormType>) => void;
  onRemoveFilter: (filter: Partial<FilterFormType>) => void;
}

export function FilterForm({
  filter,
  appliedFilter,
  onChangeFilter,
  onRemoveFilter,
}: FilterFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempFilter, setTempFilter] = useState<FilterFormType>(filter);

  const handleOpenBottomSheet = () => {
    setTempFilter(filter);
    setIsOpen(true);
  };

  const handleApplyFilter = () => {
    onChangeFilter(tempFilter);
    setIsOpen(false);
  };

  const handleTempFilterChange = (updates: Partial<FilterFormType>) => {
    setTempFilter(prev => ({ ...prev, ...updates }));
  };

  const hasFilters =
    !(appliedFilter.minSize === 0 && appliedFilter.maxSize === Infinity) &&
    (appliedFilter.minSize !== RULES.SEARCH_MIN_SIZE ||
      appliedFilter.maxSize !== RULES.SEARCH_MAX_SIZE ||
      appliedFilter.apartName ||
      appliedFilter.favoriteOnly ||
      appliedFilter.newTransactionOnly);

  return (
    <div className="relative w-full">
      <div>
        <Button
          onClick={handleOpenBottomSheet}
          className="w-full justify-between"
        >
          세부 필터
          {hasFilters && <span className="text-primary text-sm">선택됨</span>}
        </Button>
        <div className="mt-2 flex gap-1 overflow-x-auto">
          {!(
            appliedFilter.minSize === 0 && appliedFilter.maxSize === Infinity
          ) &&
            (appliedFilter.minSize !== RULES.SEARCH_MIN_SIZE ||
              appliedFilter.maxSize !== RULES.SEARCH_MAX_SIZE) && (
              <FilterLabel
                onRemove={() =>
                  onRemoveFilter({
                    minSize: RULES.SEARCH_MIN_SIZE,
                    maxSize: RULES.SEARCH_MAX_SIZE,
                  })
                }
              >
                {appliedFilter.maxSize === Infinity
                  ? `${formatPyeong(appliedFilter.minSize)} 이상`
                  : `${formatPyeong(appliedFilter.minSize)}~${formatPyeong(appliedFilter.maxSize)}`}
              </FilterLabel>
            )}
          {appliedFilter.apartName && (
            <FilterLabel onRemove={() => onRemoveFilter({ apartName: '' })}>
              {appliedFilter.apartName}
            </FilterLabel>
          )}
          {appliedFilter.favoriteOnly && (
            <FilterLabel
              onRemove={() => onRemoveFilter({ favoriteOnly: false })}
            >
              저장된 아파트
            </FilterLabel>
          )}
          {appliedFilter.newTransactionOnly && (
            <FilterLabel
              onRemove={() => onRemoveFilter({ newTransactionOnly: false })}
            >
              신규 거래
            </FilterLabel>
          )}
        </div>
      </div>

      <BottomSheet
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="세부 필터"
      >
        <div className="flex flex-col gap-4 p-4">
          {/* 필터 선택 폼 */}
          <div className="flex flex-col gap-6">
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
              <Typography className="mb-2 text-sm font-semibold">
                아파트명
              </Typography>
              <Input
                placeholder="아파트명을 입력해주세요"
                value={tempFilter.apartName}
                onChange={e =>
                  handleTempFilterChange({ apartName: e.target.value })
                }
              />
            </div>

            <div>
              <Typography className="mb-2 text-sm font-semibold">
                추가 필터
              </Typography>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  rounded
                  variant={
                    tempFilter.favoriteOnly ? 'primary-outline' : 'outline'
                  }
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
                    tempFilter.newTransactionOnly
                      ? 'primary-outline'
                      : 'outline'
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

          {/* 확인 버튼 */}
          <div className="mt-6 w-full">
            <Button
              onClick={handleApplyFilter}
              size="lg"
              variant="primary"
              className="w-full"
            >
              필터 적용
            </Button>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}
