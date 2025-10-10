import {
  getCityNameWithRegionCode,
  getRegionNameWithRegionCode,
} from '@/entities/region';

import { X } from 'lucide-react';

import { Card, Typography } from '@package/ui';
import { Button } from '@package/ui';

import { ApartItem, RegionItem } from '../models/types';

interface FavoriteApartListProps {
  regionItems: RegionItem[];
  onClickApartItem: (regionCode: string, apartItem: ApartItem) => void;
  onRemoveApartItem: (regionCode: string, apartItem: ApartItem) => void;
}

export function FavoriteApartList({
  regionItems,
  onClickApartItem,
  onRemoveApartItem,
}: FavoriteApartListProps) {
  return (
    <div className="flex w-full flex-col gap-y-5">
      {regionItems.map(region => (
        <div key={region.code}>
          <Card className="flex flex-col">
            <Typography variant="h4" className="p-3">
              {getCityNameWithRegionCode(region.code)}{' '}
              {getRegionNameWithRegionCode(region.code)}{' '}
              <strong className="text-primary">
                ({region.apartItems.length})
              </strong>
            </Typography>
            <hr className="my-0 border-gray-200" />
            <div className="flex flex-wrap gap-2 p-3">
              {region.apartItems.map(item => (
                <div
                  key={`${item.name}-${item.address}`}
                  className="border-input bg-background flex flex-shrink-0 rounded-md border"
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onClickApartItem(region.code, item)}
                    className="whitespace-nowrap rounded-r-none border-0 px-3 py-1.5 text-sm"
                  >
                    <span className="translate-y-[-0.5px]">{item.name}</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveApartItem(region.code, item)}
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
