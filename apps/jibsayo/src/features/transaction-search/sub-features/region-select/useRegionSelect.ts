import {
  getCityNameWithRegionCode,
  getRegionNameWithRegionCode,
  getRegionsWithCityName,
} from '@/entities/region';
import { STORAGE_KEY } from '@/shared/consts/storageKey';
import { useModal } from '@/shared/hooks/useModal';
import { useOnceEffect } from '@/shared/hooks/useOnceEffect';
import { getItem, setItem } from '@/shared/lib/localStorage';

import { useEffect, useMemo, useState } from 'react';

import { toast } from '@package/ui';

import { SearchForm } from '../../types';
import { convertToRegionItems, sortFavoriteRegionsSet } from './services';
import { RegionItemViewModel } from './types';

interface Params {
  form: SearchForm;
  onFormChange: (value: Partial<SearchForm>) => void;
}

interface Return {
  isOpenedModal: boolean;
  selectedCityName: string;
  regionList: RegionItemViewModel[];
  favoriteRegionList: string[];
  openModal: () => void;
  closeModal: () => void;
  selectCityName: (cityName: string) => void;
  selectRegionCode: (regionCode: string) => void;
  toggleFaoviriteRegion: (regionCode: string) => void;
}

export const useRegionSelect = ({ form, onFormChange }: Params): Return => {
  const { isOpened: isOpenedModal, openModal, closeModal } = useModal();

  const [selectedCityName, setSelectedCityName] = useState(form.cityName);
  const [favoriteRegionList, setFavoriteRegionList] = useState<string[]>([]);

  const favoriteRegionListSet = useMemo(
    () => new Set(favoriteRegionList),
    [favoriteRegionList]
  );

  const regionList = useMemo(
    () =>
      convertToRegionItems(
        getRegionsWithCityName(selectedCityName),
        favoriteRegionListSet
      ),
    [selectedCityName, favoriteRegionListSet]
  );

  const addFavoriteRegion = (regionCode: string) => {
    if (favoriteRegionListSet.has(regionCode)) return;

    const nextFavoriteRegionList = sortFavoriteRegionsSet([
      ...favoriteRegionList,
      regionCode,
    ]);
    setFavoriteRegionList(nextFavoriteRegionList);
    setItem(STORAGE_KEY.FAVORITE_REGION_LIST, nextFavoriteRegionList);

    toast.success(
      `${getCityNameWithRegionCode(regionCode)} ${getRegionNameWithRegionCode(regionCode)} 지역이 관심목록에 추가됐어요`
    );
  };

  const removeFavoriteRegion = (regionCode: string) => {
    if (!favoriteRegionListSet.has(regionCode)) return;

    const nextFavoriteRegionList = favoriteRegionList.filter(
      code => code !== regionCode
    );
    setFavoriteRegionList(nextFavoriteRegionList);
    setItem(STORAGE_KEY.FAVORITE_REGION_LIST, nextFavoriteRegionList);

    toast.success(
      `${getCityNameWithRegionCode(regionCode)} ${getRegionNameWithRegionCode(regionCode)} 지역이 관심목록에서 삭제됐어요`
    );
  };

  const toggleFaoviriteRegion = (regionCode: string) => {
    if (favoriteRegionListSet.has(regionCode)) {
      removeFavoriteRegion(regionCode);
    } else {
      addFavoriteRegion(regionCode);
    }
  };

  const selectCityName = (cityName: string) => {
    setSelectedCityName(cityName);
  };

  const selectRegionCode = (regionCode: string) => {
    onFormChange({
      cityName: getCityNameWithRegionCode(regionCode),
      regionCode,
    });
    closeModal();
  };

  useOnceEffect(true, () => {
    const savedFavoriteRegionList = getItem<string[]>(
      STORAGE_KEY.FAVORITE_REGION_LIST
    );

    if (savedFavoriteRegionList) {
      setFavoriteRegionList(savedFavoriteRegionList);
    }
  });

  useEffect(() => {
    if (isOpenedModal) {
      selectCityName(form.cityName);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, isOpenedModal]);

  return {
    isOpenedModal,
    selectedCityName,
    regionList,
    favoriteRegionList,
    openModal,
    closeModal,
    selectCityName,
    selectRegionCode,
    toggleFaoviriteRegion,
  };
};
