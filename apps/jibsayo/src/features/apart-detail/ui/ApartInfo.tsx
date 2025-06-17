import { Card, Typography } from '@package/ui';

interface Props {
  apartName: string;
  address: string;
  housholdsCount: string;
  parking: string;
  floorAreaRatio: number;
  buildingCoverageRatio: number;
}

export function ApartInfo({
  apartName,
  address,
  housholdsCount,
  parking,
  floorAreaRatio,
  buildingCoverageRatio,
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
      <Typography variant="large" className="text-primary mb-5 font-semibold">
        {apartName}
      </Typography>

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
