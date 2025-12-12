import { calculateAreaPyeong } from '@/entities/transaction';
import { NewTransactionIcon } from '@/shared/ui/NewTransactionIcon';
import { Pagination } from '@/shared/ui/Pagination';
import {
  formatDealDate,
  formatFloorText,
  formatKoreanAmountText,
  formatPyeongText,
} from '@/shared/utils/formatter';

import { Star } from 'lucide-react';

import { Card } from '@package/ui';
import { cn } from '@package/utils';

import { TRANSACTION_LIST_PAGE_SIZE } from '../../../consts';
import { TransactionItemViewModel } from '../../../types';

interface TransactionCardListProps {
  isFetching: boolean;
  totalCount: number;
  pageIndex: number;
  items: TransactionItemViewModel[];
  onPageIndexChange: (pageIndex: number) => void;
  onFavoriteToggle: (item: TransactionItemViewModel) => void;
  onRowClick: (item: TransactionItemViewModel) => void;
}

export function TransactionCardList({
  isFetching,
  totalCount,
  pageIndex,
  items,
  onPageIndexChange,
  onFavoriteToggle,
  onRowClick,
}: TransactionCardListProps) {
  return (
    <div>
      <div className="flex flex-col gap-y-2">
        {isFetching &&
          Array.from({ length: TRANSACTION_LIST_PAGE_SIZE }).map((_, index) => (
            <Card key={index}>
              <Card.Content>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex flex-col gap-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <div className="h-5 w-32 animate-pulse rounded bg-gray-200"></div>
                      <div className="h-4 w-4 animate-pulse rounded-full bg-gray-200"></div>
                    </div>
                    <div className="h-4 w-20 animate-pulse rounded bg-gray-200"></div>
                  </div>
                  <div className="flex flex-col items-end gap-y-1.5">
                    <div className="h-5 w-16 animate-pulse rounded bg-gray-200"></div>
                    <div className="h-3 w-12 animate-pulse rounded bg-gray-200"></div>
                  </div>
                </div>
              </Card.Content>
            </Card>
          ))}

        {!isFetching &&
          items.map(item => (
            <Card
              key={item.id}
              className="active:text-accent-foreground transition-colors duration-200 active:bg-gray-300"
              onClick={() => onRowClick(item)}
            >
              <Card.Content>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex flex-col gap-y-0.5">
                    <div className="relative flex flex-wrap items-center gap-2">
                      {item.isNewTransaction && (
                        <span className="absolute -top-5 left-0">
                          <NewTransactionIcon />
                        </span>
                      )}
                      <span className="inline-block text-sm font-semibold leading-5">
                        {item.apartName}
                      </span>
                      {item.apartId && (
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
                              item.isFavorite &&
                                'fill-yellow-400 text-yellow-400',
                              !item.isFavorite && 'fill-gray-300 text-gray-300'
                            )}
                          />
                        </button>
                      )}
                    </div>
                    <span className="text-sm text-gray-500">
                      {item.floor ? formatFloorText(item.floor) : ''} ·{' '}
                      {formatPyeongText(calculateAreaPyeong(item.size))}
                    </span>
                  </div>
                  <div className="flex flex-col items-end gap-y-0.5">
                    <strong className="text-primary whitespace-nowrap font-bold">
                      {formatKoreanAmountText(item.dealAmount)}
                    </strong>
                    <time className="text-xs text-gray-400">
                      {formatDealDate(item.dealDate)}
                    </time>
                  </div>
                </div>
              </Card.Content>
            </Card>
          ))}
        {totalCount > TRANSACTION_LIST_PAGE_SIZE && (
          <div className="mt-5">
            <Pagination
              pageSize={TRANSACTION_LIST_PAGE_SIZE}
              pageIndex={pageIndex}
              totalItems={totalCount}
              onPageIndexChange={onPageIndexChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}
