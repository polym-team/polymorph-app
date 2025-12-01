import { ApartDetailResponse } from '@/app/api/apart/models/types';
import {
  getCityNameWithRegionCode,
  getRegionNameWithRegionCode,
} from '@/entities/region';
import { formatNumber } from '@/shared/utils/formatter';

interface DetailInfoProps {
  regionCode: ApartDetailResponse['regionCode'];
  address: ApartDetailResponse['address'];
  apartName: ApartDetailResponse['apartName'];
  housholdsCount: ApartDetailResponse['housholdsCount'];
  parking: ApartDetailResponse['parking'];
  floorAreaRatio: ApartDetailResponse['floorAreaRatio'];
  buildingCoverageRatio: ApartDetailResponse['buildingCoverageRatio'];
}

export function DetailInfo({
  regionCode,
  address,
  apartName,
  housholdsCount,
  parking,
  floorAreaRatio,
  buildingCoverageRatio,
}: DetailInfoProps) {
  const items = [
    { label: '세대수', value: housholdsCount },
    { label: '주차', value: parking },
    {
      label: '용적률 / 건폐율',
      value: `${formatNumber(floorAreaRatio)}% / ${formatNumber(buildingCoverageRatio)}%`,
    },
  ];

  return (
    <div className="flex flex-col gap-y-4">
      <div className="flex flex-col lg:gap-y-1">
        <span className="text-lg font-semibold lg:text-xl">{apartName}</span>
        <span className="text-sm text-gray-400 lg:text-base">
          {getCityNameWithRegionCode(regionCode)}{' '}
          {getRegionNameWithRegionCode(regionCode)} {address}
        </span>
      </div>
      <div className="flex flex-col gap-y-2">
        {items.map(item => (
          <div
            key={item.label}
            className="bg-primary/5 flex items-center justify-between gap-x-3 break-keep rounded p-3 lg:justify-start"
          >
            <span className="whitespace-nowrap text-sm text-gray-500 lg:w-36 lg:text-base">
              {item.label}
            </span>
            <span className="text-primary text-right text-sm lg:text-left lg:text-base">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
