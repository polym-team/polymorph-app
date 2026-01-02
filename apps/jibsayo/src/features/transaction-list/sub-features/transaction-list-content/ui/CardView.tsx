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

import { Button, Card } from '@package/ui';

import { TRANSACTION_LIST_PAGE_SIZE } from '../../../consts';
import { TransactionItemViewModel } from '../../../types';
import { calculateTransactionDetailInfo } from '../services';
import { FavoriteButton } from './FavoriteButton';
import { PriceLabel } from './PriceLabel';

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
                <div className="flex flex-col">
                  <div className="flex items-center">
                    <div className="flex min-w-0 flex-1 items-center gap-x-1.5">
                      <div className="h-5 w-32 animate-pulse rounded bg-gray-200"></div>
                      <div className="h-[18px] w-[18px] animate-pulse rounded-full bg-gray-200"></div>
                    </div>
                    <div className="w-24 text-right">
                      <div className="ml-auto h-5 w-20 animate-pulse rounded bg-gray-200"></div>
                    </div>
                  </div>
                  <div className="mt-0.5 flex items-center justify-between">
                    <div className="w-40">
                      <div className="h-4 w-32 animate-pulse rounded bg-gray-200"></div>
                    </div>
                    <div className="flex flex-1 justify-end gap-x-2">
                      <div className="h-4 w-16 animate-pulse rounded bg-gray-200"></div>
                      <div className="h-4 w-20 animate-pulse rounded bg-gray-200"></div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex gap-x-1">
                      <div className="h-6 w-12 animate-pulse rounded bg-gray-200"></div>
                      <div className="h-6 w-24 animate-pulse rounded bg-gray-200"></div>
                    </div>
                    <div className="h-4 w-16 animate-pulse rounded bg-gray-200"></div>
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
              <Card.Content className="pb-3">
                <div className="flex flex-col">
                  <div className="flex items-center gap-x-5">
                    <div className="relative flex min-w-0 flex-1 items-center gap-x-1.5">
                      {item.isNewTransaction && (
                        <span>
                          <NewTransactionIcon />
                        </span>
                      )}
                      <span className="truncate font-semibold">
                        {item.apartName}
                      </span>
                      <span className="-translate-y-[1px]">
                        <FavoriteButton
                          active={item.isFavorite}
                          onClick={() => onFavoriteToggle(item)}
                        />
                      </span>
                    </div>
                    <div className="flex items-center justify-end gap-x-1.5">
                      {!!item.highestTransaction &&
                        item.dealAmount >
                          item.highestTransaction.dealAmount && (
                          <span className="-translate-y-[1px]">
                            <PriceLabel className="bg-red-600 text-white">
                              신고가
                            </PriceLabel>
                          </span>
                        )}
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
                      <div className="flex flex-1 flex-wrap justify-end gap-x-2 gap-y-1">
                        <div
                          className="flex items-center gap-x-1"
                          onClick={e => e.stopPropagation()}
                        >
                          <PriceLabel className="bg-red-100 text-red-600">
                            최고
                          </PriceLabel>
                          <span className="text-sm text-red-600">
                            {formatKoreanAmountText(
                              item.highestTransaction.dealAmount
                            ).replace('원', '')}
                          </span>
                        </div>
                        <div
                          className="flex items-center gap-x-1"
                          onClick={e => e.stopPropagation()}
                        >
                          <PriceLabel className="bg-blue-100 text-blue-600">
                            5년 최저
                          </PriceLabel>
                          <span className="text-sm text-blue-600">
                            {formatKoreanAmountText(
                              item.lowestTransaction.dealAmount
                            ).replace('원', '')}
                          </span>
                        </div>
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
