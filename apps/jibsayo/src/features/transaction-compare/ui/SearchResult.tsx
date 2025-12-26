import { SearchedApartmentItem } from '@/entities/apart';
import {
  getCityNameWithRegionCode,
  getRegionNameWithRegionCode,
} from '@/entities/region';
import { formatNumber } from '@/shared/utils/formatter';

import { Loader2 } from 'lucide-react';
import { Fragment } from 'react';

import { Button, Card } from '@package/ui';
import { cn } from '@package/utils';

import { calculateHighlightSegments } from '../services';

interface SearchResultProps {
  isFetching: boolean;
  items: SearchedApartmentItem[];
  selectedApartIds: number[];
  apartName: string;
  onSelect: (item: SearchedApartmentItem) => void;
}

export function SearchResult({
  isFetching,
  items,
  selectedApartIds,
  apartName,
  onSelect,
}: SearchResultProps) {
  if (isFetching) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="text-primary animate-spin" />
      </div>
    );
  }

  if (!apartName) {
    return null;
  }

  return (
    <div className="flex flex-col gap-y-2">
      <div>
        <span className="text-primary font-semibold">
          &#34;{apartName}&#34;
        </span>{' '}
        검색 결과
      </div>
      {items.length > 0 && (
        <Card className="overflow-hidden">
          {items.map((item, index) => {
            const isSelected = selectedApartIds.includes(item.id);

            return (
              <Fragment key={item.id}>
                {index > 0 && <Card.Divider />}
                <Card.Content
                  className={cn(
                    'lg:p-2 lg:pl-4',
                    isSelected && 'bg-primary/10 hover:bg-primary/20',
                    !isSelected && 'hover:bg-gray-100'
                  )}
                >
                  <div
                    className="flex cursor-pointer items-center justify-between"
                    onClick={() => onSelect(item)}
                  >
                    <div className="flex flex-col gap-y-1 lg:flex-row lg:items-center lg:gap-x-3">
                      <div>
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
                      </div>
                      <div className="text-sm text-gray-500 lg:-translate-y-[1.5px]">
                        {' '}
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
                  </div>
                </Card.Content>
              </Fragment>
            );
          })}
        </Card>
      )}
    </div>
  );
}
