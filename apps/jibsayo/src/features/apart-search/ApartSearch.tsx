'use client';

import {
  getCityNameWithRegionCode,
  getRegionNameWithRegionCode,
} from '@/entities/region';
import { formatNumber } from '@/shared/utils/formatter';

import { Loader2, Star } from 'lucide-react';

import { cn } from '@package/utils';

import { calculateHighlightSegments } from './services';
import { useApartSearch } from './useApartSearch';

export function ApartSearch() {
  const {
    isFetching,
    isEmpty,
    items,
    apartName,
    changeApartName,
    toggleFavorite,
    clickApartItem,
  } = useApartSearch();

  return (
    <div className="w-full max-w-screen-md py-5 pb-10">
      <input
        defaultValue={apartName}
        className="w-full border-gray-200 bg-white p-4 text-lg outline-none lg:rounded lg:border"
        placeholder="아파트 이름을 입력해주세요"
        onChange={e => changeApartName(e.target.value)}
      />
      {isFetching && (
        <div className="flex justify-center py-10">
          <span className="mt-2 inline-block animate-spin">
            <Loader2 size={24} color="gray" />
          </span>
        </div>
      )}
      {isEmpty && !isFetching && (
        <div className="py-10 text-center">
          <span className="text-primary">{apartName}</span>
          {'  '}
          <span className="text-gray-500">검색 결과가 없어요</span>
        </div>
      )}
      {items.length > 0 && !isFetching && (
        <div className="mt-8 px-3 lg:px-0">
          <p className="text-sm lg:text-base">
            <span className="text-primary font-semibold">{apartName}</span> 검색
            결과
          </p>
          <ul className="-mx-3 mt-3 overflow-hidden border-gray-200 bg-white lg:mx-0 lg:rounded lg:border">
            {items.map(item => (
              <li
                key={item.id}
                className="flex cursor-pointer items-center justify-between border-b border-gray-100 p-4 last:border-none hover:bg-gray-100"
                onClick={() => clickApartItem(item)}
              >
                <div className="flex items-center gap-x-2">
                  <span>
                    {calculateHighlightSegments(item.apartName, apartName).map(
                      (
                        segment: { text: string; highlighted: boolean },
                        index: number
                      ) =>
                        segment.highlighted ? (
                          <span key={index} className="text-primary">
                            {segment.text}
                          </span>
                        ) : (
                          <span key={index}>{segment.text}</span>
                        )
                    )}
                  </span>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      e.preventDefault();
                      toggleFavorite(item);
                    }}
                  >
                    <Star
                      size={18}
                      className={cn(
                        '-translate-y-[1px]',
                        item.isFavorite && 'fill-yellow-400 text-yellow-400',
                        !item.isFavorite && 'fill-gray-300 text-gray-300'
                      )}
                    />
                  </button>
                </div>
                <div className="text-sm text-gray-500">
                  {getCityNameWithRegionCode(item.regionCode)}{' '}
                  {getRegionNameWithRegionCode(item.regionCode)} {item.dong} ·{' '}
                  {item.completionYear}년식
                  {!!item.householdCount &&
                    `· ${formatNumber(item.householdCount)}세대`}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
