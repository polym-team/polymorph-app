import { FavoriteApartItem } from '@/entities/apart';

export interface FavoriteApartItemViewModel extends FavoriteApartItem {
  isFavorite: boolean;
}

export interface RegionItemViewModel {
  code: string;
  name: string;
  apartItems: FavoriteApartItemViewModel[];
}
