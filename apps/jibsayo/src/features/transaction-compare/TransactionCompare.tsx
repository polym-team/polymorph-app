'use client';

import {
  getCityNameWithRegionCode,
  getRegionNameWithRegionCode,
} from '@/entities/region';
import { formatNumber } from '@/shared/utils/formatter';

import { Loader2 } from 'lucide-react';

import { Button } from '@package/ui';

import { calculateHighlightSegments } from './services';
import { useTransactionCompare } from './useTransactionCompare';

export function TransactionCompare() {
  const {
    isFetching,
    showsItems,
    items,
    selectedApartIds,
    apartName,
    focusSearchInput,
    blurSearchInput,
    changeApartName,
    clickApartItem,
  } = useTransactionCompare();

  return (
    <div className="w-full max-w-screen-md py-5 pb-10">
      <div className="relative">
        <input
          defaultValue={apartName}
          className="w-full border-gray-200 bg-white p-4 text-lg outline-none lg:rounded lg:border"
          placeholder="비교할 아파트를 검색 후 선택해주세요"
          onChange={e => changeApartName(e.target.value)}
          onFocus={focusSearchInput}
          onBlur={blurSearchInput}
        />

        <div className="absolute w-full translate-y-1 px-3 lg:px-0">
          {showsItems && (isFetching || items.length > 0) && (
            <ul className="-mx-2 max-h-[50vh] overflow-hidden overflow-y-auto rounded border border-gray-200 bg-white lg:mx-0">
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
                      className="flex cursor-pointer items-center justify-between border-b border-gray-100 p-3 last:border-none hover:bg-gray-100"
                      onClick={() => clickApartItem(item)}
                    >
                      <div className="flex items-center gap-x-3">
                        {isSelected && (
                          <span className="bg-primary/10 text-primary rounded-sm px-2 py-1.5 text-sm">
                            선택됨
                          </span>
                        )}
                        <div className="flex flex-col gap-y-1">
                          <div className="flex items-center gap-x-2">
                            <span>
                              {calculateHighlightSegments(
                                item.apartName,
                                apartName
                              ).map(
                                (
                                  segment: {
                                    text: string;
                                    highlighted: boolean;
                                  },
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
                        {!isSelected && <Button size="sm">선택</Button>}
                      </div>
                    </li>
                  );
                })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
