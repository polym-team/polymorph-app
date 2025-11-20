import { RULES } from '@/entities/transaction';
import { useModal } from '@/shared/hooks/useModal';
import { formatPyeong } from '@/shared/utils/formatters';

import { useState } from 'react';

import { BottomSheet, Button, Input, Typography } from '@package/ui';

import { FilterForm as FilterFormType } from '../models/types';
import { FilterLabel } from './FilterLabel';
import { SizeRangeSelector } from './SizeRangeSelector';

interface FilterFormProps {
  appliedFilter: FilterFormType;
  onApplyFilter: (filter: Partial<FilterFormType>) => void;
}

export function FilterForm({ appliedFilter, onApplyFilter }: FilterFormProps) {
  const { isOpen, openModal, closeModal } = useModal();
  const [tempFilter, setTempFilter] = useState<FilterFormType>(appliedFilter);

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

  const hasSizeFilter =
    !(appliedFilter.minSize === 0 && appliedFilter.maxSize === Infinity) &&
    (appliedFilter.minSize !== RULES.SEARCH_MIN_SIZE ||
      appliedFilter.maxSize !== RULES.SEARCH_MAX_SIZE);
  const hasApartNameFilter = appliedFilter.apartName;
  const hasFavoriteOnlyFilter = appliedFilter.favoriteOnly;
  const hasNewTransactionOnlyFilter = appliedFilter.newTransactionOnly;

  const hasFilters =
    hasSizeFilter ||
    hasApartNameFilter ||
    hasFavoriteOnlyFilter ||
    hasNewTransactionOnlyFilter;

  const selectedCount = [
    hasSizeFilter,
    hasApartNameFilter,
    hasFavoriteOnlyFilter,
    hasNewTransactionOnlyFilter,
  ].filter(Boolean).length;

  return (
    <div className="relative w-full">
      <div>
        <Button
          onClick={handleOpenBottomSheet}
          className="w-full justify-between active:scale-100"
        >
          <span className="text-sm">세부 필터</span>
          {selectedCount > 0 && (
            <span className="text-primary text-sm">
              {selectedCount}개 선택됨
            </span>
          )}
        </Button>
        {hasFilters && (
          <div className="mt-2 flex gap-1 overflow-x-auto">
            {hasSizeFilter && (
              <FilterLabel
                onRemove={() =>
                  onApplyFilter({
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
            {hasApartNameFilter && (
              <FilterLabel onRemove={() => onApplyFilter({ apartName: '' })}>
                {appliedFilter.apartName}
              </FilterLabel>
            )}
            {hasFavoriteOnlyFilter && (
              <FilterLabel
                onRemove={() => onApplyFilter({ favoriteOnly: false })}
              >
                저장된 아파트
              </FilterLabel>
            )}
            {hasNewTransactionOnlyFilter && (
              <FilterLabel
                onRemove={() => onApplyFilter({ newTransactionOnly: false })}
              >
                신규 거래
              </FilterLabel>
            )}
          </div>
        )}
      </div>

      <BottomSheet isOpen={isOpen} onClose={closeModal}>
        <BottomSheet.Header>세부 필터</BottomSheet.Header>
        <BottomSheet.Body>
          <div className="flex flex-col gap-6 pb-5">
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
              size="lg"
              variant="outline"
              className="flex-1"
            >
              초기화
            </Button>
            <Button
              onClick={handleApplyFilter}
              size="lg"
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
