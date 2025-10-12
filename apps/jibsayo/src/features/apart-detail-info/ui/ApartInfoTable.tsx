import { ApartDetailResponse } from '@/app/api/apart/types';
import { FavoriteApartToggleButton } from '@/entities/apart';
import { formatNumberWithCommas } from '@/shared/utils/formatters';

import { Card } from '@package/ui';
import { Typography } from '@package/ui';

interface ApartInfoTableProps {
  isFavorite: boolean;
  data: ApartDetailResponse;
}

export function ApartInfoTable({ isFavorite, data }: ApartInfoTableProps) {
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
        <FavoriteApartToggleButton
          size="base"
          isFavorite={isFavorite}
          data={data}
        />
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
    </Card>
  );
}
