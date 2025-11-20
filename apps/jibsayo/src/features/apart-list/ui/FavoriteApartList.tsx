import { FavoriteApartItem } from '@/entities/apart/models/types';
import {
  getCityNameWithRegionCode,
  getRegionNameWithRegionCode,
} from '@/entities/region';

import { ChevronRight, X } from 'lucide-react';

import { RegionItem } from '../models/types';

interface FavoriteApartListProps {
  regionItems: RegionItem[];
  onClickApartItem: (regionCode: string, apartItem: FavoriteApartItem) => void;
  onRemoveApartItem: (regionCode: string, apartItem: FavoriteApartItem) => void;
}

export function FavoriteApartList({
  regionItems,
  onClickApartItem,
  onRemoveApartItem,
}: FavoriteApartListProps) {
  return (
    <div className="flex w-full flex-col gap-y-3 pb-10">
      {regionItems.map(region => (
        <div key={region.code}>
          <div className="p-3">
            <span className="text-sm text-gray-500">
              {getCityNameWithRegionCode(region.code)}{' '}
              {getRegionNameWithRegionCode(region.code)}{' '}
              <span className="text-primary">{region.apartItems.length}</span>
            </span>
          </div>
          <div className="flex flex-col">
            {region.apartItems.map(item => (
              <div
                key={item.apartId}
                className="flex items-center justify-between border-b border-gray-100 bg-white p-3 last:border-b-0 active:bg-gray-100"
                onClick={() => onClickApartItem(region.code, item)}
              >
                <span className="leading-1 flex items-center gap-x-1">
                  {item.apartName}{' '}
                  <ChevronRight
                    size={18}
                    className="translate-y-[-0.5px] text-gray-300"
                  />
                </span>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    e.preventDefault();
                    onRemoveApartItem(region.code, item);
                  }}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 active:bg-gray-300"
                >
                  <X size={16} className="text-gray-400" />
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
