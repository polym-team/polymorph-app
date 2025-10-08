import { formatPyeong } from '@/shared/utils/formatters';

import { useEffect, useRef, useState } from 'react';

import { Button, Input, Label, Typography } from '@package/ui';

import { TransactionFilter as TransactionFilterType } from '../models/types';
import { SizeRangeSelector } from './SizeRangeSelector';

interface TransactionFilterProps {
  filter: TransactionFilterType;
  selectedFilter: TransactionFilterType;
  onChangeFilter: (filter: Partial<TransactionFilterType>) => void;
  onResetFilter: () => void;
  onSubmitFilter: () => void;
}

export function TransactionFilter({
  filter,
  selectedFilter,
  onChangeFilter,
  onResetFilter,
  onSubmitFilter,
}: TransactionFilterProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSubmit = () => {
    onSubmitFilter();
    setIsExpanded(false);
  };

  const handleReset = () => {
    onResetFilter();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsExpanded(false);
      }
    };

    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isExpanded]);

  return (
    <div ref={containerRef} className="relative w-full sm:w-[420px]">
      <div
        className={`rounded-sm border bg-white transition-all ${
          true ? 'border-primary' : 'border-gray-200'
        }`}
      >
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex w-full items-center justify-between rounded-sm p-3 text-left transition-colors hover:bg-gray-50"
        >
          <Typography variant="small" className="text-sm font-medium">
            필터
          </Typography>
          <div className="ml-4 flex min-w-0 flex-1 items-center justify-end gap-2">
            <div className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-1">
              <span className="bg-primary text-primary-foreground rounded-sm px-2 py-1 text-xs">
                {formatPyeong(filter.minSize)} ~ {formatPyeong(filter.maxSize)}
              </span>
              {selectedFilter.apartName && (
                <span className="bg-primary text-primary-foreground rounded-sm px-2 py-1 text-xs">
                  {selectedFilter.apartName}
                </span>
              )}
              {selectedFilter.favoriteOnly && (
                <span className="bg-primary text-primary-foreground rounded-sm px-2 py-1 text-xs">
                  저장된 아파트
                </span>
              )}
              {selectedFilter.newTransactionOnly && (
                <span className="bg-primary text-primary-foreground rounded-sm px-2 py-1 text-xs">
                  신규 거래
                </span>
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
          <div className="animate-in fade-in slide-in-from-top-2 scale-in-95 absolute left-0 right-0 top-full z-50 mt-1 rounded border bg-white shadow-lg duration-200">
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
            <hr />
            <div className="flex gap-2 p-3">
              <Button
                className="w-full"
                variant="outline"
                onClick={handleReset}
              >
                초기화
              </Button>
              <Button
                className="w-full"
                variant="primary"
                onClick={handleSubmit}
              >
                적용
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
