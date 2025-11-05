import { ApartDetailResponse } from '@/app/api/apart/models/types';
import { formatNumberWithCommas } from '@/shared/utils/formatters';

import { Star } from 'lucide-react';

import { Card } from '@package/ui';
import { Typography } from '@package/ui';
import { cn } from '@package/utils';

import { KakaoMap } from './KakaoMap';

interface ApartInfoTableProps {
  isFavorite: boolean;
  data: ApartDetailResponse;
  onToggleFavorite: () => void;
}

export function ApartInfoTable({
  isFavorite,
  data,
  onToggleFavorite,
}: ApartInfoTableProps) {
  const {
    address,
    housholdsCount,
    parking,
    floorAreaRatio,
    buildingCoverageRatio,
  } = data;

  const rows = [
    { label: '주소', value: address },
    { label: '세대수(동수)', value: housholdsCount },
    { label: '주차', value: parking },
    {
      label: '용적률 / 건폐율',
      value: `${formatNumberWithCommas(floorAreaRatio)}% / ${formatNumberWithCommas(buildingCoverageRatio)}%`,
    },
  ];

  return (
    <Card className="p-3">
      <div className="mb-2 flex items-center gap-1 px-1">
        <Typography variant="large" className="text-primary font-semibold">
          {data.apartName}
        </Typography>
        <button
          type="button"
          onClick={onToggleFavorite}
          className="-translate-y-[1.5px]"
        >
          <Star
            className={cn(
              'h-[15px] w-[15px]',
              isFavorite && 'fill-yellow-400 text-yellow-400',
              !isFavorite && 'fill-gray-300 text-gray-300'
            )}
          />
        </button>
      </div>

      {rows.map((item, index) => (
        <div key={index} className="flex items-start border-t px-1 last:pb-0">
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
