import { useEffect, useState } from 'react';

import { Input, LabelCheckbox, Typography } from '@package/ui';

import { TransactionFilter } from '../models/types';
import { formatPrice } from '../services/formatter';
import { CollapsibleFilter } from './CollapsibleFilter';
import { SizeRangeSelector } from './SizeRangeSelector';

interface TransactionListHeaderProps {
  fullRegionName: string;
  filteredTransactionsLength: number;
  totalCount: number;
  averagePricePerPyeong: number;
  filter: TransactionFilter;
  setFilter: (filter: Partial<TransactionFilter>) => void;
  pyeongRange: { min: number; max: number };
}

export function TransactionListHeader({
  fullRegionName,
  filteredTransactionsLength,
  totalCount,
  averagePricePerPyeong,
  filter,
  setFilter,
  pyeongRange,
}: TransactionListHeaderProps) {
  const [searchValue, setSearchValue] = useState(filter.apartName);

  // filter.apartName이 외부에서 변경되면 searchValue도 업데이트
  useEffect(() => {
    setSearchValue(filter.apartName);
  }, [filter.apartName]);

  // apartName만 debounce 적용
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchValue !== filter.apartName) {
        setFilter({ apartName: searchValue });
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchValue, setFilter, filter.apartName]);

  const handleSizeRangeChange = (min: number, max: number) => {
    setFilter({ minSize: min, maxSize: max });
  };

  // 평수 범위 텍스트 생성
  const getSizeRangeText = () => {
    const { minSize, maxSize } = filter;
    if (minSize === 0 && maxSize === 50) {
      return '전체 평수';
    } else if (maxSize >= 50) {
      return `${minSize}평 이상`;
    } else if (minSize === maxSize) {
      return `${minSize}평`;
    } else {
      return `${minSize}평 ~ ${maxSize}평`;
    }
  };

  // 필터 텍스트 생성
  const getFilterText = () => {
    const filters = [];
    if (filter.isFavoriteOnly) filters.push('저장된 아파트');
    if (filter.isNewTransactionOnly) filters.push('신규 거래');

    if (filters.length === 0) return '전체';
    if (filters.length === 1) return filters[0];
    return filters.join(', ');
  };

  // 통합 필터 텍스트 생성 (평수 + 아파트명 + 체크박스)
  const getCombinedFilterText = () => {
    const parts = [];

    // 평수 부분
    const sizeText = getSizeRangeText();
    if (sizeText !== '전체') {
      parts.push(sizeText);
    }

    // 아파트명 부분
    if (searchValue && searchValue.trim()) {
      parts.push(searchValue);
    }

    // 체크박스 부분
    const filterText = getFilterText();
    if (filterText !== '전체') {
      parts.push(filterText);
    }

    if (parts.length === 0) return '전체';
    if (parts.length === 1) return parts[0];
    return parts.join(', ');
  };

  return (
    <div className="flex w-full flex-col gap-4 sm:flex-row">
      {/* 타이틀 섹션 */}
      <div className="flex min-w-0 flex-1 items-center justify-center gap-x-1 sm:justify-start">
        {fullRegionName && (
          <Typography className="text-sm font-bold sm:text-base">
            {fullRegionName}
          </Typography>
        )}
        <Typography variant="small" className="text-xs sm:text-sm">
          (총 거래 건수{' '}
          <span className="text-primary font-bold">
            {filteredTransactionsLength}건
          </span>
          {totalCount !== filteredTransactionsLength && (
            <span className="text-gray-500">/{totalCount}건</span>
          )}
          <span className="mx-1 text-gray-400">·</span>
          평당 거래가격{' '}
          <span className="text-primary font-bold">
            {formatPrice(averagePricePerPyeong)}
          </span>
          )
        </Typography>
      </div>

      {/* 필터 (평수 + 아파트명 + 체크박스) */}
      <CollapsibleFilter title="필터" value={getCombinedFilterText()}>
        <div className="flex flex-col gap-2">
          {/* 평수 섹션 */}
          <div className="rounded border border-gray-200 bg-white p-3">
            <SizeRangeSelector
              minSize={filter.minSize}
              maxSize={filter.maxSize}
              onRangeChange={handleSizeRangeChange}
              pyeongRange={pyeongRange}
            />
          </div>

          {/* 아파트명 섹션 */}
          <Input
            placeholder="아파트명 검색"
            value={searchValue}
            onChange={e => setSearchValue(e.target.value)}
            className={`w-full ${searchValue ? 'border-primary' : ''}`}
          />

          {/* 체크박스 섹션 */}
          <div className="flex gap-2">
            <LabelCheckbox
              className="flex-1"
              checked={filter.isFavoriteOnly}
              onCheckedChange={() =>
                setFilter({ isFavoriteOnly: !filter.isFavoriteOnly })
              }
              title="저장된 아파트"
            />
            <LabelCheckbox
              className="flex-1"
              checked={filter.isNewTransactionOnly}
              onCheckedChange={() =>
                setFilter({
                  isNewTransactionOnly: !filter.isNewTransactionOnly,
                })
              }
              title="신규 거래"
            />
          </div>
        </div>
      </CollapsibleFilter>
    </div>
  );
}
