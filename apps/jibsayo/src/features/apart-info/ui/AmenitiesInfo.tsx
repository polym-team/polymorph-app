import { HorizontalScrollContainer } from '@/shared/ui/HorizontalScrollContainer';

import { Button } from '@package/ui';

import { ApartInfoType } from '../type';
import { Container } from './Container';

interface AmenitiesInfoProps {
  data?: ApartInfoType;
}

export function AmenitiesInfo({ data }: AmenitiesInfoProps) {
  if (!data) {
    return (
      <Container title="편의시설" isLoading>
        <HorizontalScrollContainer>
          <div className="flex gap-x-1">
            {[1, 2, 3, 4, 5].map(item => (
              <div
                key={item}
                className="h-[34px] w-24 animate-pulse rounded-full bg-gray-200 lg:h-[34px]"
              />
            ))}
          </div>
        </HorizontalScrollContainer>
      </Container>
    );
  }

  if (!data.amenities?.length) {
    return null;
  }

  return (
    <Container title="편의시설">
      <HorizontalScrollContainer>
        <div className="flex gap-x-1">
          {data.amenities.map(item => (
            <Button key={item} size="sm" rounded>
              {item}
            </Button>
          ))}
        </div>
      </HorizontalScrollContainer>
    </Container>
  );
}
