import { HorizontalScrollContainer } from '@/shared/ui/HorizontalScrollContainer';

import { Button } from '@package/ui';

import { ApartInfoType } from '../type';
import { Container } from './Container';

interface AmenitiesInfoProps {
  data: ApartInfoType;
}

export function AmenitiesInfo({ data }: AmenitiesInfoProps) {
  if (!data.amenities?.length) {
    return null;
  }

  return (
    <Container title=" 편의시설">
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
