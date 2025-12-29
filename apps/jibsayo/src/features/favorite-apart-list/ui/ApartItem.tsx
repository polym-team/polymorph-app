import { calculateAreaPyeong } from '@/entities/transaction';
import { NewTransactionIcon } from '@/shared/ui/NewTransactionIcon';
import {
  formatDealDate,
  formatFloorText,
  formatKoreanAmountText,
  formatPyeongText,
} from '@/shared/utils/formatter';

import { Star } from 'lucide-react';

import { FavoriteApartItemViewModel } from '../types';

interface ApartItemProps {
  item: FavoriteApartItemViewModel;
  onToggle: () => void;
  onClick: () => void;
}

export function ApartItem({ item, onToggle, onClick }: ApartItemProps) {
  return (
    <div
      key={item.apartId}
      className="flex flex-col items-start gap-1 border-b border-gray-100 bg-white p-3 transition-colors duration-200 last:border-b-0 active:bg-gray-100 md:cursor-pointer md:flex-row md:items-center md:justify-between md:px-5 md:py-4 md:first:rounded-t md:last:rounded-b md:hover:bg-gray-100"
      onClick={() => onClick()}
    >
      <span className="leading-1 relative flex items-center gap-x-1">
        {item.hasNewTransaction && (
          <span>
            <NewTransactionIcon />
          </span>
        )}
        {item.apartName}
        <button
          onClick={e => {
            e.stopPropagation();
            e.preventDefault();
            onToggle();
          }}
          className="flex h-7 w-7 -translate-y-[1px] items-center justify-center rounded-full active:bg-gray-200"
        >
          <Star
            size={16}
            className={
              item.isFavorite
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-gray-300 text-gray-300'
            }
          />
        </button>
      </span>
      <div className="gap-x flex flex-col gap-2 md:flex-row md:gap-x-5">
        {item.latestTransaction && (
          <div className="flex items-center gap-x-2">
            <span className="bg-primary/5 text-primary rounded-sm px-1.5 py-0.5 text-sm">
              최근 거래
            </span>
            <div className="flex items-center gap-x-1">
              <span className="text-sm font-semibold">
                {formatKoreanAmountText(
                  item.latestTransaction.dealAmount * 10000
                )}
              </span>
              ·
              <span className="text-sm">
                {formatDealDate(item.latestTransaction.dealDate)}
              </span>
              ·
              <span className="text-sm">
                {formatPyeongText(
                  calculateAreaPyeong(item.latestTransaction.size)
                )}
              </span>
              ·
              <span className="text-sm">
                {formatFloorText(item.latestTransaction.floor)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
