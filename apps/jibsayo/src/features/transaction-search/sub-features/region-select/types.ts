import { RegionItem } from '@/entities/region';

export interface RegionItemViewModel extends RegionItem {
  isFavorite: boolean;
}
