import { getCityNameWithRegionCode } from '@/entities/region';

import { MonthPicker } from '@package/ui';

import { SearchForm as SearchFormType } from '../models/types';
import '../services/calculator';
import { FavoriteRegionList } from './FavoriteRegionList';
import { RegionSelect } from './RegionSelect';

interface SearchFormProps {
  form: SearchFormType;
  favoriteRegionList: string[];
  onAddFavoriteRegion: (regionCode: string) => void;
  onRemoveFavoriteRegion: (regionCode: string) => void;
  onChangeForm: (value: Partial<SearchFormType>) => void;
}

export function SearchForm({
  form,
  favoriteRegionList,
  onAddFavoriteRegion,
  onRemoveFavoriteRegion,
  onChangeForm,
}: SearchFormProps) {
  const handleSelecRegionCode = (regionCode: string) => {
    onChangeForm({
      cityName: getCityNameWithRegionCode(regionCode),
      regionCode,
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <RegionSelect
        favoriteRegionList={favoriteRegionList}
        selectedCityName={form.cityName}
        selectedRegionCode={form.regionCode}
        onAddFavoriteRegion={onAddFavoriteRegion}
        onRemoveFavoriteRegion={onRemoveFavoriteRegion}
        onSelect={handleSelecRegionCode}
      />
      <FavoriteRegionList
        favoriteRegionList={favoriteRegionList}
        onRemove={onRemoveFavoriteRegion}
        onSelect={handleSelecRegionCode}
      />
      <MonthPicker
        value={form.tradeDate}
        onChange={tradeDate => onChangeForm({ tradeDate })}
      />
    </div>
  );
}
