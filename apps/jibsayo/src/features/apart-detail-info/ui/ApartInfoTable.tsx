import { ApartDetailResponse } from '@/app/api/apart/models/types';
import {
  getCityNameWithRegionCode,
  getRegionNameWithRegionCode,
} from '@/entities/region';
import { formatNumberWithCommas } from '@/shared/utils/formatters';

import { KakaoMap } from './KakaoMap';

interface ApartInfoTableProps {
  data: ApartDetailResponse;
}

export function ApartInfoTable({ data }: ApartInfoTableProps) {
  const {
    apartName,
    address,
    housholdsCount,
    parking,
    floorAreaRatio,
    buildingCoverageRatio,
  } = data;

  return (
    <div className="flex flex-col gap-y-4 bg-white p-3">
      <div className="flex flex-col">
        <span className="text-lg font-semibold">{apartName}</span>
        <span className="text-sm text-gray-400">
          {getCityNameWithRegionCode(data.regionCode)}{' '}
          {getRegionNameWithRegionCode(data.regionCode)} {address}
        </span>
      </div>
      <div className="flex flex-col gap-y-2">
        <div className="bg-primary/5 flex items-center justify-between gap-x-2 rounded p-3">
          <span className="whitespace-nowrap text-sm text-gray-500">
            세대수
          </span>
          <span className="text-primary text-sm">{housholdsCount}</span>
        </div>
        <div className="bg-primary/5 flex items-center justify-between gap-x-2 rounded p-3">
          <span className="whitespace-nowrap text-sm text-gray-500">주차</span>
          <span className="text-primary text-sm">{parking}</span>
        </div>
        <div className="bg-primary/5 flex items-center justify-between gap-x-2 rounded p-3">
          <span className="whitespace-nowrap text-sm text-gray-500">
            용적률 / 건폐율
          </span>
          <span className="text-primary text-sm">
            {formatNumberWithCommas(floorAreaRatio)}% /{' '}
            {formatNumberWithCommas(buildingCoverageRatio)}%
          </span>
        </div>
      </div>
      <KakaoMap address={address} apartName={data.apartName} />
    </div>
  );
}
