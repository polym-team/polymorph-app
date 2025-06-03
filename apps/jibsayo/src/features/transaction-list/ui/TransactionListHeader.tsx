import { Input, LabelCheckbox, Typography } from '@package/ui';

import { formatPrice } from '../services/formatter';

interface TransactionListHeaderProps {
  hasTransactions: boolean;
  fullRegionName: string;
  filteredTransactionsLength: number;
  totalCount: number;
  averagePricePerPyeong: number;
  isFavoriteOnly: boolean;
  isNationalSizeOnly: boolean;
  searchTerm: string;
  onFavoriteOnlyChange: (checked: boolean) => void;
  onNationalSizeOnlyChange: (checked: boolean) => void;
  onSearchTermChange: (term: string) => void;
}

export function TransactionListHeader({
  hasTransactions,
  fullRegionName,
  filteredTransactionsLength,
  totalCount,
  averagePricePerPyeong,
  isFavoriteOnly,
  isNationalSizeOnly,
  searchTerm,
  onFavoriteOnlyChange,
  onNationalSizeOnlyChange,
  onSearchTermChange,
}: TransactionListHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-x-1">
        <Typography className="font-bold">{fullRegionName}</Typography>
        {filteredTransactionsLength > 0 && (
          <Typography variant="small">
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
        )}
      </div>
      <div className="flex items-center gap-x-2">
        <LabelCheckbox
          checked={isFavoriteOnly}
          onCheckedChange={onFavoriteOnlyChange}
          title="저장된 아파트"
        />
        <LabelCheckbox
          checked={isNationalSizeOnly}
          onCheckedChange={onNationalSizeOnlyChange}
          title="국민평수"
        />
        <Input
          placeholder="아파트명 검색"
          value={searchTerm}
          onChange={e => onSearchTermChange(e.target.value)}
          className="w-64"
        />
      </div>
    </div>
  );
}
