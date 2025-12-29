import { calculateAreaPyeong } from '@/entities/transaction';
import { NewTransactionIcon } from '@/shared/ui/NewTransactionIcon';
import { Pagination } from '@/shared/ui/Pagination';
import {
  formatDealDate,
  formatFloorText,
  formatKoreanAmountText,
  formatPyeongText,
  formatSizeText,
} from '@/shared/utils/formatter';

import { ArrowDown, ArrowUp, Star } from 'lucide-react';

import { Button, Card } from '@package/ui';
import { cn } from '@package/utils';

import { TRANSACTION_LIST_PAGE_SIZE } from '../../../consts';
import { TransactionItemViewModel } from '../../../types';
import { calculateTransactionDetailInfo } from '../services';

interface CardViewProps {
  isFetching: boolean;
  totalCount: number;
  pageIndex: number;
  items: TransactionItemViewModel[];
  onPageIndexChange: (pageIndex: number) => void;
  onFavoriteToggle: (item: TransactionItemViewModel) => void;
  onRowClick: (item: TransactionItemViewModel) => void;
}

export function CardView({
  isFetching,
  totalCount,
  pageIndex,
  items,
  onPageIndexChange,
  onFavoriteToggle,
  onRowClick,
}: CardViewProps) {
  return (
    <div>
      <div className="flex flex-col gap-y-2">
        {isFetching &&
          Array.from({ length: TRANSACTION_LIST_PAGE_SIZE }).map((_, index) => (
            <Card key={index}>
              <Card.Content className="pb-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex flex-col gap-y-0.5">
                    <div className="flex items-center gap-2">
                      <div className="h-5 w-32 animate-pulse rounded bg-gray-200"></div>
                      <div className="h-[18px] w-[18px] animate-pulse rounded-full bg-gray-200"></div>
                    </div>
                    <div className="h-4 w-24 animate-pulse rounded bg-gray-200"></div>
                  </div>
                  <div className="flex flex-col items-end gap-y-0.5">
                    <div className="h-5 w-20 animate-pulse rounded bg-gray-200"></div>
                    <div className="flex gap-x-2">
                      <div className="h-4 w-12 animate-pulse rounded bg-gray-200"></div>
                      <div className="h-4 w-12 animate-pulse rounded bg-gray-200"></div>
                    </div>
                  </div>
                </div>
              </Card.Content>
              <hr className="border-gray-100" />
              <Card.Content className="py-2 pl-3">
                <div className="flex items-center justify-between">
                  <div className="flex gap-x-1">
                    <div className="h-6 w-12 animate-pulse rounded bg-gray-200"></div>
                    <div className="h-6 w-24 animate-pulse rounded bg-gray-200"></div>
                  </div>
                  <div className="h-4 w-16 animate-pulse rounded bg-gray-200"></div>
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
              <Card.Content className="pb-3">
                <div className="flex flex-col">
                  <div className="flex items-center">
                    <div className="relative flex min-w-0 flex-1 items-center gap-x-1.5">
                      {item.isNewTransaction && (
                        <span>
                          <NewTransactionIcon />
                        </span>
                      )}
                      <span className="truncate font-semibold leading-5">
                        {item.apartName}
                      </span>
                      {item.apartId && (
                        <button
                          type="button"
                          className="flex-shrink-0 -translate-y-[0.5px]"
                          onClick={e => {
                            e.stopPropagation();
                            e.preventDefault();
                            onFavoriteToggle(item);
                          }}
                        >
                          <Star
                            size={18}
                            className={cn(
                              item.isFavorite &&
                                'fill-yellow-400 text-yellow-400',
                              !item.isFavorite && 'fill-gray-300 text-gray-300'
                            )}
                          />
                        </button>
                      )}
                    </div>
                    <div className="w-24 text-right">
                      <span className="text-primary whitespace-nowrap font-bold">
                        {formatKoreanAmountText(item.dealAmount)}
                      </span>
                    </div>
                  </div>
                  <div className="mt-0.5 flex items-center justify-between">
                    <div className="w-40">
                      <span className="text-sm text-gray-500">
                        {calculateTransactionDetailInfo(item).join(' · ')}
                      </span>
                    </div>
                    {item.highestTransaction && item.lowestTransaction && (
                      <div className="flex flex-1 flex-wrap justify-end gap-x-2">
                        <span
                          className="flex items-center gap-x-[1px] text-sm text-red-600"
                          onClick={e => e.stopPropagation()}
                        >
                          <ArrowUp size={16} />
                          {formatKoreanAmountText(
                            item.highestTransaction.dealAmount
                          ).replace('원', '')}
                        </span>
                        <span
                          className="flex items-center gap-x-[1px] text-sm text-blue-600"
                          onClick={e => e.stopPropagation()}
                        >
                          <ArrowDown size={16} />
                          {formatKoreanAmountText(
                            item.lowestTransaction.dealAmount
                          ).replace('원', '')}{' '}
                          (최근 5년)
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex gap-x-1">
                      {item.floor && (
                        <Button size="xs">{formatFloorText(item.floor)}</Button>
                      )}
                      <Button size="xs">
                        {formatPyeongText(calculateAreaPyeong(item.size))} (
                        {formatSizeText(Number(item.size))})
                      </Button>
                    </div>
                    <div>
                      <time className="text-xs text-gray-400">
                        {formatDealDate(item.dealDate)}
                      </time>
                    </div>
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
