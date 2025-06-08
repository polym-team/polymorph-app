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
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
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
        <div className="flex gap-2 sm:items-center sm:gap-x-2">
          <div className="flex-1 sm:flex-none">
            <LabelCheckbox
              checked={filter.isFavoriteOnly}
              onCheckedChange={() =>
                setFilter({ isFavoriteOnly: !filter.isFavoriteOnly })
              }
              title="저장된 아파트"
            />
          </div>
          <div className="flex-1 sm:flex-none">
            <LabelCheckbox
              checked={filter.isNationalSizeOnly}
              onCheckedChange={() =>
                setFilter({ isNationalSizeOnly: !filter.isNationalSizeOnly })
              }
              title="국민평수"
            />
          </div>
        </div>
        <Input
          placeholder="아파트명 검색"
          value={filter.apartName}
          onChange={e => setFilter({ apartName: e.target.value })}
          className="w-full sm:w-64"
        />
      </div>
    </div>
  );
}
