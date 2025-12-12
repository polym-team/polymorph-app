'use client';

import { ApartInfoType } from './type';
import { AmenitiesInfo } from './ui/AmenitiesInfo';
import { ApartDetailInfo } from './ui/ApartDetailInfo';
import { ApartName } from './ui/ApartName';
import { LocationInfo } from './ui/LocationInfo';
import { useApartInfo } from './useApartInfo';

interface ApartInfoProps {
  apartId: number | null;
  data?: ApartInfoType;
}

export function ApartInfo({ apartId, data }: ApartInfoProps) {
  const { isFavorited, toggleFavorite } = useApartInfo({
    apartId,
    data,
  });

  return (
    <div className="flex flex-col gap-y-5 lg:gap-y-0">
      <ApartName
        data={data}
        apartId={apartId}
        isFavorited={isFavorited}
        onFavoriteToggle={toggleFavorite}
      />
      {apartId && (
        <>
          <ApartDetailInfo data={data} />
          <AmenitiesInfo data={data} />
          <LocationInfo data={data} />
        </>
      )}
    </div>
  );
}
