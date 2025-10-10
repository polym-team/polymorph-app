import { RULES } from '@/entities/transaction';
import { formatPyeong } from '@/shared/utils/formatters';

import { useState } from 'react';

import { Button, Input, Typography } from '@package/ui';
import { cn } from '@package/utils';

import { FilterForm as FilterFormType } from '../models/types';
import { FilterLabel } from './FilterLabel';
import { SizeRangeSelector } from './SizeRangeSelector';

interface FilterFormProps {
  filter: FilterFormType;
  onChangeFilter: (filter: Partial<FilterFormType>) => void;
}

export function FilterForm({ filter, onChangeFilter }: FilterFormProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="relative w-full">
      <div
        className={cn(
          'overflow-hidden rounded border border-gray-200 bg-white transition-colors',
          isExpanded && 'border-primary'
        )}
      >
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex min-h-[38.5px] w-full items-center justify-between rounded-sm px-3 py-2 text-left transition-colors hover:bg-gray-50"
        >
          <Typography variant="small" className="text-sm font-medium">
            세부 필터
          </Typography>
          <div className="ml-4 flex min-w-0 flex-1 items-center justify-end gap-2">
            <div className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-1">
              {(filter.minSize !== RULES.SEARCH_MIN_SIZE ||
                filter.maxSize !== RULES.SEARCH_MAX_SIZE) && (
                <FilterLabel
                  onRemove={() =>
                    onChangeFilter({
                      minSize: RULES.SEARCH_MIN_SIZE,
                      maxSize: RULES.SEARCH_MAX_SIZE,
                    })
                  }
                >
                  {formatPyeong(filter.minSize)} ~{' '}
                  {formatPyeong(filter.maxSize)}{' '}
                </FilterLabel>
              )}
              {filter.apartName && (
                <FilterLabel onRemove={() => onChangeFilter({ apartName: '' })}>
                  {filter.apartName}
                </FilterLabel>
              )}
              {filter.favoriteOnly && (
                <FilterLabel
                  onRemove={() => onChangeFilter({ favoriteOnly: false })}
                >
                  저장된 아파트
                </FilterLabel>
              )}
              {filter.newTransactionOnly && (
                <FilterLabel
                  onRemove={() => onChangeFilter({ newTransactionOnly: false })}
                >
                  신규 거래
                </FilterLabel>
              )}
            </div>

            <svg
              className={`h-4 w-4 flex-shrink-0 text-gray-400 transition-transform duration-200 ease-in-out ${
                isExpanded ? 'rotate-180' : 'rotate-0'
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </button>

        {isExpanded && (
          <div className="animate-in fade-in slide-in-from-top-2 scale-in-95 border-t bg-white shadow-lg duration-200">
            <div className="flex flex-col gap-2 p-3">
              <SizeRangeSelector
                minSize={filter.minSize}
                maxSize={filter.maxSize}
                onRangeChange={(minSize, maxSize) =>
                  onChangeFilter({ minSize, maxSize })
                }
              />
              <div>
                <Input
                  size="sm"
                  placeholder="아파트명"
                  value={filter.apartName}
                  onChange={e => onChangeFilter({ apartName: e.target.value })}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="w-full"
                  variant={filter.favoriteOnly ? 'primary' : 'outline'}
                  onClick={() =>
                    onChangeFilter({ favoriteOnly: !filter.favoriteOnly })
                  }
                >
                  저장된 아파트
                </Button>
                <Button
                  size="sm"
                  className="w-full"
                  variant={filter.newTransactionOnly ? 'primary' : 'outline'}
                  onClick={() =>
                    onChangeFilter({
                      newTransactionOnly: !filter.newTransactionOnly,
                    })
                  }
                >
                  신규 거래
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
