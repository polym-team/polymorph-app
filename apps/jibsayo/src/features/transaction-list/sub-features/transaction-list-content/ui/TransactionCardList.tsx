import { calculateAreaPyeong } from '@/entities/transaction';
import { NewTransactionIcon } from '@/shared/ui/NewTransactionIcon';
import { Pagination } from '@/shared/ui/Pagination';
import {
  formatDealDate,
  formatFloorText,
  formatKoreanAmountText,
  formatNumber,
  formatPyeongText,
  formatSizeText,
} from '@/shared/utils/formatter';

import { ArrowDown, ArrowUp, Star } from 'lucide-react';

import { Button, Card } from '@package/ui';
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
                <div className="flex items-center justify-between gap-2">
                  <div className="flex flex-col gap-y-0.5">
                    <div className="relative flex flex-wrap items-center gap-2">
                      {item.isNewTransaction && (
                        <span className="absolute -top-5 left-0">
                          <NewTransactionIcon />
                        </span>
                      )}
                      <span className="inline-block font-semibold leading-5">
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
                            size={18}
                            className={cn(
                              '-translate-y-[1px]',
                              item.isFavorite &&
                                'fill-yellow-400 text-yellow-400',
                              !item.isFavorite && 'fill-gray-300 text-gray-300'
                            )}
                          />
                        </button>
                      )}
                    </div>
                    {item.householdCount || item.buildedYear ? (
                      <div>
                        <span className="-translate-y-[1px] text-sm text-gray-500">
                          {!!item.householdCount &&
                            `${formatNumber(item.householdCount)}세대`}
                          {!!item.householdCount &&
                            !!item.completionYear &&
                            ' · '}
                          {!!item.completionYear &&
                            `${item.completionYear}년식`}
                        </span>
                      </div>
                    ) : null}
                  </div>
                  <div className="flex flex-col items-end gap-y-0.5">
                    <strong className="text-primary whitespace-nowrap font-bold">
                      {formatKoreanAmountText(item.dealAmount)}
                    </strong>
                    {item.highestTransaction && item.lowestTransaction && (
                      <div className="flex justify-end gap-x-2">
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
                          (직전 5년)
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </Card.Content>
              <hr className="border-gray-100" />
              <Card.Content className="py-2 pl-3">
                <div className="flex items-center justify-between">
                  <div className="flex gap-x-1">
                    {item.floor && (
                      <Button size="xs">{formatFloorText(item.floor)}</Button>
                    )}
                    <Button size="xs">
                      {formatPyeongText(calculateAreaPyeong(item.size))} (
                      {formatSizeText(Number(item.size))})
                    </Button>
                  </div>
                  <time className="text-xs text-gray-400">
                    {formatDealDate(item.dealDate)}
                  </time>
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
