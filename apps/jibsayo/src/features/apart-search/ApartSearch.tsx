'use client';

import {
  getCityNameWithRegionCode,
  getRegionNameWithRegionCode,
} from '@/entities/region';
import { HorizontalScrollContainer } from '@/shared/ui/HorizontalScrollContainer';
import { PageContainer } from '@/shared/ui/PageContainer';
import { formatNumber } from '@/shared/utils/formatter';

import { Search, SearchIcon, Star, X } from 'lucide-react';

import { Button, Card } from '@package/ui';
import { cn } from '@package/utils';

import { calculateHighlightSegments } from './services';
import { useApartSearch } from './useApartSearch';

export function ApartSearch() {
  const {
    isFetching,
    isEmpty,
    items,
    apartName,
    recentSearchedApartNames,
    changeApartName,
    toggleFavorite,
    clickApartItem,
    removeRecentSearchedApartName,
  } = useApartSearch();

  return (
    <div className="flex flex-col gap-y-3">
      <PageContainer>
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-[10px] text-gray-300"
            size={20}
          />
          <X
            size={20}
            className="absolute right-3 top-1/2 -translate-y-[10px] cursor-pointer text-gray-400"
            onClick={() => changeApartName('')}
          />
          <input
            defaultValue={apartName}
            className="w-full rounded bg-gray-100 p-4 pl-10 outline-none"
            placeholder="아파트 이름으로 검색"
            onChange={e => changeApartName(e.target.value)}
          />
        </div>
      </PageContainer>
      {recentSearchedApartNames.length > 0 && (
        <PageContainer>
          <div className="flex flex-col gap-y-2">
            <span className="text-sm text-gray-500">최근 검색</span>
            <div className="scrollbar-hide overflow-y-auto">
              <HorizontalScrollContainer className="gap-1">
                {recentSearchedApartNames.map(item => (
                  <Button
                    key={item}
                    size="sm"
                    variant="outline"
                    rounded
                    onClick={() => changeApartName(item)}
                  >
                    {item}
                    <span
                      className="-translate-y-[1px]"
                      onClick={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        removeRecentSearchedApartName(item);
                      }}
                    >
                      <X />
                    </span>
                  </Button>
                ))}
              </HorizontalScrollContainer>
            </div>
          </div>
        </PageContainer>
      )}
      {isEmpty && (
        <div className="flex flex-col items-center gap-y-5 py-10">
          <SearchIcon className="text-gray-400" size={40} />
          <div className="flex flex-col items-center gap-y-1">
            <p className="font-semibold text-gray-600">아파트를 검색하세요</p>
            <p className="text-sm text-gray-500">
              아파트 이름을 입력하거나 최근 검색 목록에서 선택할 수 있어요
            </p>
          </div>
        </div>
      )}
      {!isFetching && !isEmpty && (
        <PageContainer className="flex flex-col gap-y-2">
          <p className="text-sm lg:text-base">
            <span className="text-primary font-semibold">
              &#34;{apartName}&#34;
            </span>{' '}
            검색 결과
          </p>
          {items.length === 0 && (
            <div className="color-gray-500 py-10 text-center">
              검색 결과가 없어요
            </div>
          )}
          {items.length > 0 && (
            <Card className="overflow-hidden">
              {items.map((item, index) => (
                <>
                  {index > 0 && <Card.Divider />}
                  <Card.Content
                    key={item.id}
                    className="flex cursor-pointer flex-col gap-y-1 active:bg-gray-200 lg:flex-row lg:items-center lg:justify-between lg:hover:bg-gray-100"
                    onClick={() => clickApartItem(item)}
                  >
                    <div className="flex items-center gap-x-2">
                      <span>
                        {calculateHighlightSegments(
                          item.apartName,
                          apartName
                        ).map(
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
                            item.isFavorite &&
                              'fill-yellow-400 text-yellow-400',
                            !item.isFavorite && 'fill-gray-300 text-gray-300'
                          )}
                        />
                      </button>
                    </div>
                    <div className="text-sm text-gray-500">
                      {getCityNameWithRegionCode(item.regionCode)}{' '}
                      {getRegionNameWithRegionCode(item.regionCode)} {item.dong}{' '}
                      · {item.completionYear}년식
                      {!!item.householdCount &&
                        ` · ${formatNumber(item.householdCount)}세대`}
                    </div>
                  </Card.Content>
                </>
              ))}
            </Card>
          )}
        </PageContainer>
      )}
    </div>
  );
}
