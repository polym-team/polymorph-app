import { useEffect, useState } from 'react';

import { Input, LabelCheckbox, Typography } from '@package/ui';

import { TransactionFilter } from '../models/types';
import { formatPrice } from '../services/formatter';
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

  return (
    <div className="flex w-full flex-col gap-4">
      {/* 타이틀과 컨트롤 그룹 */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        {/* 타이틀 섹션 */}
        <div className="flex items-center gap-x-1">
          {fullRegionName && (
            <>
              <Typography className="text-sm font-bold sm:text-base">
                {fullRegionName}
              </Typography>
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
            </>
          )}
        </div>

        {/* 컨트롤 그룹 */}
        <div className="flex flex-wrap items-center gap-2">
          {/* 평수 범위 선택 */}
          <SizeRangeSelector
            minSize={filter.minSize}
            maxSize={filter.maxSize}
            onRangeChange={handleSizeRangeChange}
            pyeongRange={pyeongRange}
            className="w-full sm:w-auto"
          />

          {/* 저장된 아파트, 신규거래 체크박스 */}
          <div className="flex w-full gap-2 sm:w-auto sm:gap-2">
            <LabelCheckbox
              checked={filter.isFavoriteOnly}
              onCheckedChange={() =>
                setFilter({ isFavoriteOnly: !filter.isFavoriteOnly })
              }
              title="저장된 아파트"
              className="w-1/2 sm:w-auto"
            />
            <LabelCheckbox
              checked={filter.isNewTransactionOnly}
              onCheckedChange={() =>
                setFilter({
                  isNewTransactionOnly: !filter.isNewTransactionOnly,
                })
              }
              title="신규 거래"
              className="w-1/2 sm:w-auto"
            />
          </div>

          {/* 아파트명 검색 */}
          <Input
            placeholder="아파트명 검색"
            value={searchValue}
            onChange={e => setSearchValue(e.target.value)}
            className="w-full sm:w-48"
          />
        </div>
      </div>
    </div>
  );
}
