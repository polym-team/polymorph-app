import { ApartDetailResponse } from '@/app/api/apart/types';
import { formatNumberWithCommas } from '@/shared/utils/formatters';

import { Star } from 'lucide-react';

import { Card } from '@package/ui';
import { Typography } from '@package/ui';

interface ApartInfoTableProps {
  isFavorite: boolean;
  apartName: string;
  data: ApartDetailResponse;
  onToggleFavorite: () => void;
}

export function ApartInfoTable({
  isFavorite,
  apartName,
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
    <Card className="p-3 md:p-5">
      <div className="mb-2 flex items-center gap-1 px-1">
        <Typography variant="large" className="text-primary font-semibold">
          {apartName}
        </Typography>
        <button
          type="button"
          onClick={onToggleFavorite}
          className="flex h-8 w-8 items-center justify-center"
        >
          <Star
            className={`h-5 w-5 ${
              isFavorite
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-gray-300 text-gray-300'
            }`}
          />
        </button>
      </div>

      {rows.map((item, index) => (
        <div
          key={index}
          className="flex items-center border-t px-1 py-2 last:pb-0"
        >
          <div className="w-[110px] py-2 lg:w-40 xl:w-64">
            <Typography className="text-sm font-medium text-gray-500">
              {item.label}
            </Typography>
          </div>
          <div className="flex-1">{item.value || '-'}</div>
        </div>
      ))}
    </Card>
  );
}
