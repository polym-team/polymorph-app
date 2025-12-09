'use client';

import { ApartInfoType } from './type';
import { AmenitiesInfo } from './ui/AmenitiesInfo';
import { ApartDetailInfo } from './ui/ApartDetailInfo';
import { ApartName } from './ui/ApartName';
import { EmptyInfo } from './ui/EmptyInfo';
import { LocationInfo } from './ui/LocationInfo';
import { useApartInfo } from './useApartInfo';

interface ApartInfoProps {
  apartToken: string;
  data?: ApartInfoType;
}

export function ApartInfo({ apartToken, data }: ApartInfoProps) {
  const { isEmptyData, isFavorited, toggleFavorite } = useApartInfo({
    apartToken,
    data,
  });

  return (
    <div className="flex flex-col gap-y-5 lg:gap-y-0">
      <ApartName
        data={data}
        isFavorited={isFavorited}
        onFavoriteToggle={toggleFavorite}
      />
      {isEmptyData && <EmptyInfo />}
      {!isEmptyData && (
        <>
          <ApartDetailInfo data={data} />
          <AmenitiesInfo data={data} />
          <LocationInfo data={data} />
        </>
      )}
    </div>
  );
}
