'use client';

import { FavoriteApartItem } from '@/entities/apart';
import {
  getCityNameWithRegionCode,
  getRegionNameWithRegionCode,
} from '@/entities/region';
import { PageContainer } from '@/shared/ui/PageContainer';

import { ChevronRight, Star } from 'lucide-react';

import { RegionItemViewModel } from '../types';

interface FavoriteApartListProps {
  regionItems: RegionItemViewModel[];
  favoriteApartIds: string[];
  onClickApartItem: (regionCode: string, apartItem: FavoriteApartItem) => void;
  onAddApartItem: (regionCode: string, apartItem: FavoriteApartItem) => void;
  onRemoveApartItem: (regionCode: string, apartItem: FavoriteApartItem) => void;
}

export function FavoriteApartList({
  regionItems,
  favoriteApartIds,
  onClickApartItem,
  onAddApartItem,
  onRemoveApartItem,
}: FavoriteApartListProps) {
  return (
    <PageContainer className="p-0 lg:p-3">
      <div className="flex w-full flex-col gap-y-3 pb-10">
        {regionItems.map(region => (
          <div key={region.code}>
            <div className="p-3 lg:px-0">
              <span className="text-sm text-gray-500 lg:text-base">
                {getCityNameWithRegionCode(region.code)}{' '}
                {getRegionNameWithRegionCode(region.code)}{' '}
                <span className="text-primary">{region.apartItems.length}</span>
              </span>
            </div>
            <div className="flex flex-col lg:overflow-hidden lg:rounded lg:shadow-sm">
              {region.apartItems.map(item => {
                const isFavorited = favoriteApartIds.includes(item.apartId);

                return (
                  <div
                    key={item.apartId}
                    className="flex items-center justify-between border-b border-gray-100 bg-white p-3 transition-colors duration-200 last:border-b-0 active:bg-gray-100 lg:cursor-pointer lg:hover:bg-gray-100"
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

                        if (isFavorited) {
                          onRemoveApartItem(region.code, item);
                        } else {
                          onAddApartItem(region.code, item);
                        }
                      }}
                      className="flex h-7 w-7 items-center justify-center rounded-full active:bg-gray-200"
                    >
                      <Star
                        size={16}
                        className={
                          isFavorited
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'fill-gray-300 text-gray-300'
                        }
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}
