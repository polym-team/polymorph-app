import {
  getCityNameWithRegionCode,
  getRegionNameWithRegionCode,
} from '@/entities/region';
import { RegionItem } from '@/entities/region/models/types';

import { X } from 'lucide-react';

import { Card, Typography } from '@package/ui';
import { Button } from '@package/ui';

interface ApartListProps {
  regionItems: RegionItem[];
  onClickApartItem: (regionCode: string, apartName: string) => void;
  onRemoveApartItem: (regionCode: string, apartName: string) => void;
}

export function ApartList({
  regionItems,
  onClickApartItem,
  onRemoveApartItem,
}: ApartListProps) {
  return (
    <div className="flex flex-col gap-y-5">
      {regionItems.map(region => (
        <div key={region.code}>
          <Card className="flex flex-col">
            <Typography variant="small" className="p-3 md:p-5">
              {getCityNameWithRegionCode(region.code)}{' '}
              {getRegionNameWithRegionCode(region.code)}{' '}
              <strong className="text-primary">
                ({region.apartItems.length})
              </strong>
            </Typography>
            <hr className="my-0 border-gray-200" />
            <div className="flex flex-wrap gap-2 p-3 md:p-4">
              {region.apartItems.map(item => (
                <div
                  key={`${item.apartName}-${item.address}`}
                  className="border-input bg-background flex flex-shrink-0 rounded-md border"
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      onClickApartItem(region.code, item.apartName)
                    }
                    className="whitespace-nowrap rounded-r-none border-0 px-3 py-1.5 text-sm"
                  >
                    <span className="translate-y-[-0.5px]">
                      {item.apartName}
                    </span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      onRemoveApartItem(region.code, item.apartName)
                    }
                    className="h-full min-w-0 rounded-l-none border-0 px-2 py-1.5"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      ))}
    </div>
  );
}
