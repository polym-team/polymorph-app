import { useEffect, useState } from 'react';

import { Input, LabelCheckbox, Typography } from '@package/ui';

import { TransactionFilter } from '../models/types';
import { formatPrice } from '../services/formatter';

interface TransactionListHeaderProps {
  fullRegionName: string;
  filteredTransactionsLength: number;
  totalCount: number;
  averagePricePerPyeong: number;
  filter: TransactionFilter;
  setFilter: (filter: Partial<TransactionFilter>) => void;
}

export function TransactionListHeader({
  fullRegionName,
  filteredTransactionsLength,
  totalCount,
  averagePricePerPyeong,
  filter,
  setFilter,
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

  return (
    <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center justify-center gap-x-1 sm:justify-start">
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
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-x-2">
        <div className="flex w-full">
          <LabelCheckbox
            checked={filter.isNewTransactionOnly}
            onCheckedChange={() =>
              setFilter({
                isNewTransactionOnly: !filter.isNewTransactionOnly,
              })
            }
            title="신규 거래"
            className={`hover:bg-primary/5 data-[state=checked]:bg-primary/5 data-[state=checked]:border-primary/20 h-full flex-1 rounded-none rounded-l border-r ${
              filter.isNewTransactionOnly ? 'z-10' : ''
            }`}
          />
          <LabelCheckbox
            checked={filter.isFavoriteOnly}
            onCheckedChange={() =>
              setFilter({ isFavoriteOnly: !filter.isFavoriteOnly })
            }
            title="저장된 아파트"
            className={`hover:bg-primary/5 data-[state=checked]:bg-primary/5 data-[state=checked]:border-primary/20 -mx-px h-full flex-1 rounded-none border-r ${
              filter.isFavoriteOnly ? 'z-10' : ''
            }`}
          />
          <LabelCheckbox
            checked={filter.isNationalSizeOnly}
            onCheckedChange={() =>
              setFilter({
                isNationalSizeOnly: !filter.isNationalSizeOnly,
              })
            }
            title="국민평수"
            className={`hover:bg-primary/5 data-[state=checked]:bg-primary/5 data-[state=checked]:border-primary/20 h-full flex-1 rounded-none rounded-r ${
              filter.isNationalSizeOnly ? 'z-10' : ''
            }`}
          />
        </div>
        <Input
          placeholder="아파트명 검색"
          value={searchValue}
          onChange={e => setSearchValue(e.target.value)}
          className="w-full sm:w-64"
        />
      </div>
    </div>
  );
}
