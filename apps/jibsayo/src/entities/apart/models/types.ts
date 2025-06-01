export interface ApartItem {
  apartId: string;
  apartName: string;
}

export interface FavoriteApartItem {
  regionCode: string;
  apartItems: ApartItem[];
}
