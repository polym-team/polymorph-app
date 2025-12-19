'use client';

import {
  getCityNameWithRegionCode,
  getRegionNameWithRegionCode,
} from '@/entities/region';
import { PageContainer } from '@/shared/ui/PageContainer';
import { formatNumber } from '@/shared/utils/formatter';

import { ChartLine, Loader2, Search, X } from 'lucide-react';

import { Button } from '@package/ui';
import { cn } from '@package/utils';

import { MAX_COMPARE_APART_COUNT } from './consts';
import { calculateHighlightSegments } from './services';
import { CompareChart } from './sub-features/compare-chart';
import { useTransactionCompare } from './useTransactionCompare';

export function TransactionCompare() {
  const {
    isFetching,
    showsItems,
    items,
    selectedApartIds,
    apartNameValue,
    focusSearchInput,
    blurSearchInput,
    changeApartName,
    clickApartItem,
  } = useTransactionCompare();

  return (
    <PageContainer className="py-5 pb-10">
      <div className="relative mb-6">
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
          className={cn(
            'w-full rounded border border-gray-200 bg-white p-4 pl-10 outline-none',
            showsItems && 'rounded-b-none'
          )}
          placeholder="비교할 아파트 검색"
          value={apartNameValue}
          onChange={e => changeApartName(e.target.value)}
          onFocus={focusSearchInput}
          onBlur={blurSearchInput}
        />
        <div className="absolute z-50 w-full -translate-y-[1px]">
          {showsItems && (
            <ul className="max-h-[50vh] overflow-hidden overflow-y-auto rounded rounded-t-none border border-gray-200 bg-white lg:mx-0">
              {isFetching && (
                <li className="py-10 text-center">
                  <span className="mt-2 inline-block animate-spin">
                    <Loader2 size={24} color="gray" />
                  </span>
                </li>
              )}
              {!isFetching &&
                items.map(item => {
                  const isSelected = selectedApartIds.includes(item.id);

                  return (
                    <li
                      key={item.id}
                      className={cn(
                        'flex cursor-pointer items-center justify-between border-b border-gray-100 p-3 last:border-none',
                        isSelected && 'bg-primary/10 hover:bg-primary/20',
                        !isSelected && 'hover:bg-gray-100'
                      )}
                      onClick={() => clickApartItem(item)}
                    >
                      <div className="flex flex-col gap-x-3 gap-y-1 lg:flex-row lg:items-center">
                        <div className="flex">
                          <div className="flex flex-col gap-y-1">
                            <div className="flex items-center gap-x-2">
                              <span>
                                {calculateHighlightSegments(
                                  item.apartName,
                                  apartNameValue
                                ).map(
                                  (
                                    segment: {
                                      text: string;
                                      highlighted: boolean;
                                    },
                                    index: number
                                  ) =>
                                    segment.highlighted ? (
                                      <span
                                        key={index}
                                        className="text-primary"
                                      >
                                        {segment.text}
                                      </span>
                                    ) : (
                                      <span key={index}>{segment.text}</span>
                                    )
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          {getCityNameWithRegionCode(item.regionCode)}{' '}
                          {getRegionNameWithRegionCode(item.regionCode)}{' '}
                          {item.dong} · {item.completionYear}년식
                          {!!item.householdCount &&
                            ` · ${formatNumber(item.householdCount)}세대`}
                        </div>
                      </div>
                      <div>
                        {isSelected && (
                          <Button size="sm" variant="primary-light">
                            선택됨
                          </Button>
                        )}
                        {!isSelected && <Button size="sm">선택</Button>}
                      </div>
                    </li>
                  );
                })}
            </ul>
          )}
        </div>
      </div>
      {selectedApartIds.length === 0 && (
        <div className="mt-12 flex flex-col items-center gap-y-5">
          <ChartLine className="text-gray-400" size={40} />
          <div className="flex flex-col items-center gap-y-1">
            <p className="font-semibold text-gray-600">
              비교할 아파트를 검색하세요
            </p>
            <p className="text-sm text-gray-500">
              최대 {MAX_COMPARE_APART_COUNT}개까지 비교할 수 있어요
            </p>
          </div>
        </div>
      )}
      <CompareChart
        selectedApartIds={selectedApartIds}
        onRemoveApartId={apartId => {
          clickApartItem(items.find(item => item.id === apartId)!);
        }}
      />
    </PageContainer>
  );
}
