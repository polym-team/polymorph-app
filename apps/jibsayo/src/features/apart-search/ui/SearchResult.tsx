import {
  getCityNameWithRegionCode,
  getRegionNameWithRegionCode,
} from '@/entities/region';
import { PageContainer } from '@/shared/ui/PageContainer';
import { formatNumber } from '@/shared/utils/formatter';

import { Loader2, Star } from 'lucide-react';
import { Fragment } from 'react';

import { Card } from '@package/ui';
import { cn } from '@package/utils';

import { calculateHighlightSegments } from '../services';
import { ApartSearchItemViewModel } from '../types';

interface SearchResultProps {
  isFetching: boolean;
  apartName: string;
  items: ApartSearchItemViewModel[];
  onClickItem: (item: ApartSearchItemViewModel) => void;
  onToggleFavorite: (item: ApartSearchItemViewModel) => void;
}

export function SearchResult({
  isFetching,
  apartName,
  items,
  onClickItem,
  onToggleFavorite,
}: SearchResultProps) {
  return (
    <PageContainer className="flex flex-col gap-y-2">
      <p className="text-sm lg:text-base">
        <span className="text-primary font-semibold">
          &#34;{apartName}&#34;
        </span>{' '}
        검색 결과
      </p>
      {isFetching && (
        <div className="flex justify-center py-10">
          <Loader2 className="text-primary animate-spin" />
        </div>
      )}
      {!isFetching && items.length === 0 && (
        <div className="flex justify-center py-10">
          <span className="text-gray-500">검색 결과가 없어요</span>
        </div>
      )}
      {!isFetching && items.length > 0 && (
        <Card className="overflow-hidden">
          {items.map((item, index) => (
            <Fragment key={item.id}>
              {index > 0 && <Card.Divider />}
              <Card.Content
                className="flex cursor-pointer flex-col gap-y-1 active:bg-gray-200 lg:flex-row lg:items-center lg:justify-between lg:hover:bg-gray-100"
                onClick={() => onClickItem(item)}
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
                    className="lg:translate-y-[0.5px]"
                    onClick={e => {
                      e.stopPropagation();
                      e.preventDefault();
                      onToggleFavorite(item);
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
                  <span>
                    {calculateHighlightSegments(
                      getCityNameWithRegionCode(item.regionCode),
                      apartName
                    ).map((segment, idx) =>
                      segment.highlighted ? (
                        <span key={idx} className="text-primary">
                          {segment.text}
                        </span>
                      ) : (
                        <span key={idx}>{segment.text}</span>
                      )
                    )}
                  </span>{' '}
                  <span>
                    {calculateHighlightSegments(
                      getRegionNameWithRegionCode(item.regionCode),
                      apartName
                    ).map((segment, idx) =>
                      segment.highlighted ? (
                        <span key={idx} className="text-primary">
                          {segment.text}
                        </span>
                      ) : (
                        <span key={idx}>{segment.text}</span>
                      )
                    )}
                  </span>{' '}
                  <span>
                    {calculateHighlightSegments(item.dong, apartName).map(
                      (segment, idx) =>
                        segment.highlighted ? (
                          <span key={idx} className="text-primary">
                            {segment.text}
                          </span>
                        ) : (
                          <span key={idx}>{segment.text}</span>
                        )
                    )}
                  </span>{' '}
                  · {item.completionYear}년식
                  {!!item.householdCount &&
                    ` · ${formatNumber(item.householdCount)}세대`}
                </div>
              </Card.Content>
            </Fragment>
          ))}
        </Card>
      )}
    </PageContainer>
  );
}
