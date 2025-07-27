import { Star } from 'lucide-react';

import { Card, Typography } from '@package/ui';

interface Props {
  apartName: string;
  address: string;
  housholdsCount: string;
  parking: string;
  floorAreaRatio: number;
  buildingCoverageRatio: number;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

export function ApartInfo({
  apartName,
  address,
  housholdsCount,
  parking,
  floorAreaRatio,
  buildingCoverageRatio,
  isFavorite,
  onToggleFavorite,
}: Props) {
  const infoItems = [
    { label: '주소', value: address },
    { label: '세대수(동수)', value: housholdsCount },
    { label: '주차', value: parking },
    {
      label: '용적률 / 건폐율',
      value: `${floorAreaRatio}% / ${buildingCoverageRatio}%`,
    },
  ];

  return (
    <Card className="p-3 md:p-5">
      <div className="mb-5 flex items-center gap-1">
        <Typography variant="large" className="text-primary font-semibold">
          {apartName}
        </Typography>
        <button
          type="button"
          onClick={onToggleFavorite}
          className="flex h-8 w-8 items-center justify-center transition-transform hover:scale-110"
        >
          <Star
            className={`h-5 w-5 -translate-y-[0.5px] ${
              isFavorite
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-gray-300 text-gray-300'
            }`}
          />
        </button>
      </div>

      {infoItems.map((item, index) => (
        <div key={index} className="flex items-center border-t py-2 last:pb-0">
          <div className="w-[110px] py-2 lg:w-40 xl:w-64">
            <Typography
              variant="small"
              className="text-sm font-medium text-gray-500"
            >
              {item.label}
            </Typography>
          </div>
          <div className="flex-1">
            <Typography className="text-sm font-medium">
              {item.value || '-'}
            </Typography>
          </div>
        </div>
      ))}
    </Card>
  );
}
