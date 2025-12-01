import {
  getCityNameWithRegionCode,
  getRegionNameWithRegionCode,
} from '@/entities/region';

import { FavoriteApartItemViewModel, RegionItemViewModel } from '../types';
import { ApartItem } from './ApartItem';

interface RegionItemProps {
  item: RegionItemViewModel;
  onToggleFavorite: (item: FavoriteApartItemViewModel) => void;
  onClickApart: (item: FavoriteApartItemViewModel) => void;
}

export function RegionItem({
  item,
  onToggleFavorite,
  onClickApart,
}: RegionItemProps) {
  return (
    <div>
      <div className="p-3 lg:px-0">
        <span className="text-sm text-gray-500 lg:text-base">
          {getCityNameWithRegionCode(item.code)}{' '}
          {getRegionNameWithRegionCode(item.code)}{' '}
          <span className="text-primary">{item.apartItems.length}</span>
        </span>
      </div>
      <div className="flex flex-col lg:overflow-hidden lg:rounded lg:border lg:border-gray-100">
        {item.apartItems.map(item => (
          <ApartItem
            key={item.apartId}
            item={item}
            onToggle={() => onToggleFavorite(item)}
            onClick={() => onClickApart(item)}
          />
        ))}
      </div>
    </div>
  );
}
