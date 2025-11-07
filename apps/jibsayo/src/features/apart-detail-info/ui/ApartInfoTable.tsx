import { ApartDetailResponse } from '@/app/api/apart/models/types';
import {
  getCityNameWithRegionCode,
  getRegionNameWithRegionCode,
} from '@/entities/region';
import { formatNumberWithCommas } from '@/shared/utils/formatters';

import { Card } from '@package/ui';
import { Typography } from '@package/ui';

import { KakaoMap } from './KakaoMap';

interface ApartInfoTableProps {
  data: ApartDetailResponse;
}

export function ApartInfoTable({ data }: ApartInfoTableProps) {
  const {
    address,
    housholdsCount,
    parking,
    floorAreaRatio,
    buildingCoverageRatio,
  } = data;

  const rows = [
    {
      label: '주소',
      value: `${getCityNameWithRegionCode(data.regionCode)} ${getRegionNameWithRegionCode(data.regionCode)} ${address}`,
    },
    { label: '세대수(동수)', value: housholdsCount },
    { label: '주차', value: parking },
    {
      label: '용적률 / 건폐율',
      value: `${formatNumberWithCommas(floorAreaRatio)}% / ${formatNumberWithCommas(buildingCoverageRatio)}%`,
    },
  ];

  return (
    <Card className="p-3 pt-0">
      {rows.map((item, index) => (
        <div
          key={index}
          className="flex items-center border-t px-1 first:border-t-0 first:pt-0 last:pb-0"
        >
          <div className="w-[110px] py-3.5">
            <Typography className="text-sm font-medium text-gray-500">
              {item.label}
            </Typography>
          </div>
          <div className="flex-1 py-3">{item.value || '-'}</div>
        </div>
      ))}
      <KakaoMap address={address} apartName={data.apartName} />
    </Card>
  );
}
