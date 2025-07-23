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
  const [isSizeRangeExpanded, setIsSizeRangeExpanded] = useState(false);

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
      return '전체';
    } else if (maxSize >= 50) {
      return `${minSize}평 이상`;
    } else if (minSize === maxSize) {
      return `${minSize}평`;
    } else {
      return `${minSize}평 ~ ${maxSize}평`;
    }
  };

  return (
    <div className="flex w-full flex-col gap-4">
      {/* 타이틀과 컨트롤 그룹 */}
      <div className="flex flex-wrap items-start justify-between gap-2">
        {/* 타이틀 섹션 */}
        <div className="my-[9.5px] flex items-center gap-x-1">
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
        <div className="flex flex-wrap items-start gap-2">
          {/* 평수 범위 선택 */}
          <div className="w-full sm:w-[300px]">
            <div className="rounded-sm border border-gray-200 bg-white transition-all">
              {/* 상단 헤더 - 두 상태에서 공통 사용 */}
              <button
                onClick={() => setIsSizeRangeExpanded(!isSizeRangeExpanded)}
                className="flex h-[35px] w-full items-center justify-between px-3 text-left transition-colors hover:bg-gray-50"
              >
                <Typography variant="small" className="text-sm font-medium">
                  평수
                </Typography>
                <div className="flex items-center gap-2">
                  <Typography variant="small" className="text-sm text-gray-600">
                    {getSizeRangeText()}
                  </Typography>
                  <svg
                    className={`h-4 w-4 text-gray-400 transition-transform ${
                      isSizeRangeExpanded ? 'rotate-180' : ''
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

              {/* 펼쳐진 상태에서만 SizeRangeSelector 표시 */}
              {isSizeRangeExpanded && (
                <div className="p-3">
                  <SizeRangeSelector
                    minSize={filter.minSize}
                    maxSize={filter.maxSize}
                    onRangeChange={handleSizeRangeChange}
                    pyeongRange={pyeongRange}
                  />
                </div>
              )}
            </div>
          </div>

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
