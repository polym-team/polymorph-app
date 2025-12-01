import {
  cityNameList,
  getCityNameWithRegionCode,
  getRegionNameWithRegionCode,
} from '@/entities/region';
import { HorizontalScrollContainer } from '@/shared/ui/HorizontalScrollContainer';

import { Star, X } from 'lucide-react';

import {
  BottomSheet,
  Button,
  Select,
  SelectTrigger,
  SelectValue,
} from '@package/ui';
import { cn } from '@package/utils';

import { SearchForm } from '../../types';
import { useRegionSelect } from './useRegionSelect';

interface RegionSelectProps {
  form: SearchForm;
  onFormChange: (value: Partial<SearchForm>) => void;
}

export function RegionSelect({ form, onFormChange }: RegionSelectProps) {
  const {
    isOpenedModal,
    selectedCityName,
    regionList,
    favoriteRegionList,
    openModal,
    closeModal,
    selectCityName,
    selectRegionCode,
    toggleFaoviriteRegion,
  } = useRegionSelect({ form, onFormChange });

  return (
    <div>
      <Select
        value={`${selectedCityName} ${getRegionNameWithRegionCode(form.regionCode)}`}
      >
        <SelectTrigger className="w-full" onClick={openModal}>
          <SelectValue placeholder="지역 선택">
            {selectedCityName} {getRegionNameWithRegionCode(form.regionCode)}
          </SelectValue>
        </SelectTrigger>
      </Select>
      <BottomSheet isOpen={isOpenedModal} size="sm" onClose={closeModal}>
        <BottomSheet.Header>지역 선택</BottomSheet.Header>
        <BottomSheet.Body>
          <div className="flex flex-col gap-y-6">
            {favoriteRegionList.length > 0 && (
              <div className="flex flex-col gap-y-2">
                <span className="text-sm text-gray-500 lg:text-base">
                  저장된 지역
                </span>
                <HorizontalScrollContainer>
                  <div className="flex gap-x-1">
                    {favoriteRegionList.map(regionCode => (
                      <Button
                        key={regionCode}
                        size="sm"
                        variant="primary-light"
                        rounded
                        className="pr-2"
                        onClick={() => selectRegionCode(regionCode)}
                      >
                        <span>
                          {getCityNameWithRegionCode(regionCode)}{' '}
                          {getRegionNameWithRegionCode(regionCode)}
                        </span>
                        <span
                          onClick={e => {
                            e.stopPropagation();
                            e.preventDefault();
                            toggleFaoviriteRegion(regionCode);
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
              <span className="text-sm text-gray-500 lg:text-base">
                지역 선택
              </span>
              <div className="relative flex gap-x-2">
                <ul className="flex w-1/3 flex-col">
                  {cityNameList.map(item => (
                    <li key={item}>
                      <button
                        className={cn(
                          'active:bg-accent lg:hover:bg-accent w-full rounded p-3 text-left text-sm transition-colors duration-300 lg:text-base',
                          selectedCityName === item
                            ? 'bg-accent text-primary'
                            : ''
                        )}
                        onClick={() => selectCityName(item)}
                      >
                        {item}
                      </button>
                    </li>
                  ))}
                </ul>
                <ul className="scrollbar-hide max-h-[50vh] w-2/3 overflow-y-auto pb-28">
                  {regionList.map(item => (
                    <li key={item.code}>
                      <button
                        className={cn(
                          'active:bg-accent lg:hover:bg-accent flex w-full items-center gap-x-2 rounded p-3 text-left text-sm transition-colors duration-300 lg:text-base',
                          form.regionCode === item.code
                            ? 'bg-accent text-primary'
                            : ''
                        )}
                        onClick={() => selectRegionCode(item.code)}
                      >
                        {item.name}
                        <span className="lg:translate-y-[-1px]">
                          <Star
                            className={cn(
                              'h-4 w-4 lg:h-5 lg:w-5',
                              item.isFavorite
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'fill-gray-300 text-gray-300'
                            )}
                            onClick={e => {
                              e.preventDefault();
                              e.stopPropagation();
                              toggleFaoviriteRegion(item.code);
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
