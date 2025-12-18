import { SearchedApartmentItem } from '@/entities/apart';

export interface ApartSearchItemViewModel extends SearchedApartmentItem {
  isFavorite: boolean;
}
