import {
  cityNameList,
  getRegionNameWithRegionCode,
  getRegionsWithCityName,
} from '@/entities/region';
import { useModal } from '@/shared/hooks/useModal';

import { Star } from 'lucide-react';
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
    setLocalSelectedRegionCode(regionCode);
  };

  const handleSelect = () => {
    onSelect(localSelectedRegionCode);
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
          <div className="relative flex gap-x-2 pb-5">
            <ul className="flex w-1/3 flex-col">
              {cityNameList.map(cityName => (
                <li key={cityName}>
                  <button
                    className={cn(
                      'w-full rounded p-3 text-left text-sm transition-colors duration-200 active:bg-gray-100',
                      localSelectedCityName === cityName ? 'bg-gray-100' : ''
                    )}
                    onClick={() => handleSelectCityName(cityName)}
                  >
                    {cityName}
                  </button>
                </li>
              ))}
            </ul>
            <ul className="scrollbar-hide max-h-[50vh] w-2/3 overflow-y-auto">
              {regionList.map(region => (
                <li key={region.code}>
                  <button
                    className={cn(
                      'flex w-full items-center gap-x-2 rounded p-3 text-left text-sm transition-colors duration-200 active:bg-gray-100',
                      localSelectedRegionCode === region.code
                        ? 'bg-gray-100'
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
            <div className="pointer-events-none absolute bottom-0 left-0 h-12 w-full bg-gradient-to-t from-white to-transparent" />
          </div>
        </BottomSheet.Body>
        <BottomSheet.Footer>
          <Button className="w-full" variant="primary" onClick={handleSelect}>
            적용
          </Button>
        </BottomSheet.Footer>
      </BottomSheet>
    </div>
  );
}
