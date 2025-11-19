import { CardList } from '@/shared/ui/CardList';
import { Pagination } from '@/shared/ui/Pagination';
import {
  formatDate,
  formatKoreanAmountSimpleText,
} from '@/shared/utils/formatters';

import { Star } from 'lucide-react';

import { cn } from '@package/utils';

import { TRANSACTION_LIST_PAGE_SIZE } from '../consts/rules';
import { TransactionDetailItem } from '../models/types';

interface TransactionCardListProps {
  items: TransactionDetailItem[];
  totalItems: number;
  pageIndex: number;
  onFavoriteToggle: (item: TransactionDetailItem) => void;
  onPageIndexChange: (pageIndex: number) => void;
  onRowClick: (item: TransactionDetailItem) => void;
}

export function TransactionCardList({
  items,
  totalItems,
  pageIndex,
  onFavoriteToggle,
  onPageIndexChange,
  onRowClick,
}: TransactionCardListProps) {
  return (
    <div className="flex flex-col gap-y-5">
      <CardList>
        {items.map((item, index) => (
          <CardList.Item
            key={`${item.transactionId}__${index}`}
            onClick={() => onRowClick(item)}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex flex-col gap-y-0.5">
                <div className="flex flex-wrap items-center gap-1">
                  <span className="inline-block text-sm font-semibold leading-5">
                    {item.apartName}
                  </span>
                  <button
                    type="button"
                    className="-translate-y-[0.5px]"
                    onClick={e => {
                      e.stopPropagation();
                      e.preventDefault();
                      onFavoriteToggle(item);
                    }}
                  >
                    <Star
                      className={cn(
                        'h-[16px] w-[16px]',
                        item.isFavorite && 'fill-yellow-400 text-yellow-400',
                        !item.isFavorite && 'fill-gray-300 text-gray-300'
                      )}
                    />
                  </button>
                </div>
                <span className="text-sm text-gray-500">6층 · 34평</span>
              </div>
              <div className="flex flex-col items-end gap-y-0.5">
                <strong className="text-primary whitespace-nowrap font-bold">
                  {formatKoreanAmountSimpleText(item.tradeAmount)}
                </strong>
                <time className="text-xs text-gray-400">
                  {formatDate(item.tradeDate)}
                </time>
              </div>
            </div>
          </CardList.Item>
        ))}
      </CardList>
      <Pagination
        pageIndex={pageIndex}
        totalItems={totalItems}
        pageSize={TRANSACTION_LIST_PAGE_SIZE}
        onPageIndexChange={onPageIndexChange}
      />
    </div>
  );
}
