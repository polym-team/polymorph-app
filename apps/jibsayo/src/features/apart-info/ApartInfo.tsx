'use client';

import { ApartInfoType } from './type';
import { AmenitiesInfo } from './ui/AmenitiesInfo';
import { ApartDetailInfo } from './ui/ApartDetailInfo';
import { ApartName } from './ui/ApartName';
import { LocationInfo } from './ui/LocationInfo';

interface ApartInfoProps {
  data?: ApartInfoType;
}

export function ApartInfo({ data }: ApartInfoProps) {
  return (
    <div className="flex flex-col gap-y-5 lg:gap-y-0">
      {data && (
        <>
          <ApartName data={data} />
          <ApartDetailInfo data={data} />
          <AmenitiesInfo data={data} />
          <LocationInfo apartName={data.apartName} dong={data.dong} />
        </>
      )}

      {!data && <></>}
    </div>
  );
}
