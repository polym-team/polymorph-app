import { HorizontalScrollContainer } from '@/shared/ui/HorizontalScrollContainer';
import { PageContainer } from '@/shared/ui/PageContainer';

import { Button } from '@package/ui';

import { ApartInfoType } from '../type';

interface AmenitiesInfoProps {
  data?: ApartInfoType;
}

export function AmenitiesInfo({ data }: AmenitiesInfoProps) {
  if (!data) {
    return (
      <PageContainer
        bgColor="white"
        className="flex flex-col gap-y-3 py-4 lg:py-6"
      >
        <span className="h-5 w-20 animate-pulse rounded bg-gray-200 lg:h-6" />
        <HorizontalScrollContainer>
          <div className="flex gap-x-1">
            {[1, 2, 3, 4, 5].map(item => (
              <div
                key={item}
                className="h-[34px] w-20 animate-pulse rounded-full bg-gray-200 lg:h-[34px]"
              />
            ))}
          </div>
        </HorizontalScrollContainer>
      </PageContainer>
    );
  }

  if (!data.amenities?.length) {
    return null;
  }

  return (
    <PageContainer
      bgColor="white"
      className="flex flex-col gap-y-3 py-4 lg:py-6"
    >
      <span className="text-sm text-gray-500 lg:text-base">편의시설</span>
      <HorizontalScrollContainer>
        <div className="flex gap-x-1">
          {data.amenities.map(item => (
            <Button key={item} size="sm" rounded>
              {item}
            </Button>
          ))}
        </div>
      </HorizontalScrollContainer>
    </PageContainer>
  );
}
