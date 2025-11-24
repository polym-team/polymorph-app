import {
  cityNameList,
  getRegionNameWithRegionCode,
  getRegionsWithCityName,
} from '@/entities/region';
import { useModal } from '@/shared/hooks/useModal';
import { HorizontalScrollContainer } from '@/shared/ui/HorizontalScrollContainer';

import { Star, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import {
  BottomSheet,
  Button,
  Select,
  SelectTrigger,
  SelectValue,
} from '@package/ui';
import { cn } from '@package/utils';

interface RegionSelectProps {
  favoriteRegionList: string[];
  selectedCityName: string;
  selectedRegionCode: string;
  onAddFavoriteRegion: (regionCode: string) => void;
  onRemoveFavoriteRegion: (regionCode: string) => void;
  onSelect: (regionCode: string) => void;
}

export function RegionSelect({
  favoriteRegionList,
  selectedCityName,
  selectedRegionCode,
  onAddFavoriteRegion,
  onRemoveFavoriteRegion,
  onSelect,
}: RegionSelectProps) {
  const { isOpen, openModal, closeModal } = useModal();

  const [localSelectedCityName, setLocalSelectedCityName] =
    useState(selectedCityName);
  const [localSelectedRegionCode, setLocalSelectedRegionCode] =
    useState(selectedRegionCode);
  const regionList = getRegionsWithCityName(localSelectedCityName);

  useEffect(() => {
    setLocalSelectedCityName(selectedCityName);
    setLocalSelectedRegionCode(selectedRegionCode);
  }, [selectedCityName, selectedRegionCode, isOpen]);

  const handleSelectCityName = (cityName: string) => {
    setLocalSelectedCityName(cityName);
    setLocalSelectedRegionCode(getRegionsWithCityName(cityName)[0].code);
  };

  const handleSelectRegionCode = (regionCode: string) => {
    onSelect(regionCode);
    closeModal();
  };

  return (
    <div>
      <Select
        value={`${selectedCityName} ${getRegionNameWithRegionCode(selectedRegionCode)}`}
      >
        <SelectTrigger className="w-full" onClick={openModal}>
          <SelectValue placeholder="지역 선택">
            {selectedCityName} {getRegionNameWithRegionCode(selectedRegionCode)}
          </SelectValue>
        </SelectTrigger>
      </Select>
      <BottomSheet isOpen={isOpen} onClose={closeModal}>
        <BottomSheet.Header>지역 선택</BottomSheet.Header>
        <BottomSheet.Body>
          <div className="flex flex-col gap-y-6">
            {favoriteRegionList.length > 0 && (
              <div className="flex flex-col gap-y-2">
                <span className="text-sm text-gray-500">저장된 지역</span>
                <HorizontalScrollContainer>
                  <div className="flex gap-x-1">
                    {favoriteRegionList.map(regionCode => (
                      <Button
                        key={regionCode}
                        size="xs"
                        variant="primary-light"
                        rounded
                        className="pr-2"
                        onClick={() => handleSelectRegionCode(regionCode)}
                      >
                        <span>{getRegionNameWithRegionCode(regionCode)}</span>
                        <span
                          onClick={e => {
                            e.stopPropagation();
                            e.preventDefault();
                            onRemoveFavoriteRegion(regionCode);
                          }}
                        >
                          <X className="h-4 w-4 translate-y-[-0.5px]" />
                        </span>
                      </Button>
                    ))}
                  </div>
                </HorizontalScrollContainer>
              </div>
            )}
            <div className="flex flex-col gap-y-2">
              <span className="text-sm text-gray-500">지역 선택</span>
              <div className="relative flex gap-x-2">
                <ul className="flex w-1/3 flex-col">
                  {cityNameList.map(cityName => (
                    <li key={cityName}>
                      <button
                        className={cn(
                          'active:bg-accent w-full rounded p-3 text-left text-sm transition-colors duration-300',
                          localSelectedCityName === cityName
                            ? 'bg-accent text-primary'
                            : ''
                        )}
                        onClick={() => handleSelectCityName(cityName)}
                      >
                        {cityName}
                      </button>
                    </li>
                  ))}
                </ul>
                <ul className="scrollbar-hide max-h-[50vh] w-2/3 overflow-y-auto pb-28">
                  {regionList.map(region => (
                    <li key={region.code}>
                      <button
                        className={cn(
                          'active:bg-accent flex w-full items-center gap-x-2 rounded p-3 text-left text-sm transition-colors duration-300',
                          localSelectedRegionCode === region.code
                            ? 'bg-accent text-primary'
                            : ''
                        )}
                        onClick={() => handleSelectRegionCode(region.code)}
                      >
                        {region.name}
                        <span>
                          <Star
                            className={cn(
                              'h-4 w-4',
                              favoriteRegionList.includes(region.code)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'fill-gray-300 text-gray-300'
                            )}
                            onClick={e => {
                              e.preventDefault();
                              e.stopPropagation();

                              if (favoriteRegionList.includes(region.code)) {
                                onRemoveFavoriteRegion(region.code);
                              } else {
                                onAddFavoriteRegion(region.code);
                              }
                            }}
                          />
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="pointer-events-none absolute bottom-0 left-0 h-36 w-full bg-gradient-to-t from-white to-transparent" />
              </div>
            </div>
          </div>
        </BottomSheet.Body>
      </BottomSheet>
    </div>
  );
}
