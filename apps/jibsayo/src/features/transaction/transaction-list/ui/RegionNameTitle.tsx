import { Typography } from '@package/ui';

interface RegionNameTitleProps {
  cityName: string;
  regionName: string;
}

export function RegionNameTitle({
  cityName,
  regionName,
}: RegionNameTitleProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <strong>
          {cityName} {regionName}
        </strong>
      </div>
      <div className="text-right">
        <p className="text-sm text-gray-600">
          총 거래 건수 <strong className="text-primary">37</strong>건
        </p>
        <p className="text-sm text-gray-600">
          평당 거래가격 <strong className="text-primary">8,175</strong>만원
        </p>
      </div>
    </div>
  );
}
