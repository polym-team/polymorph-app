export interface ApartItem {
  apartName: string;
  address: string;
}

export interface FavoriteApartItem {
  regionCode: string;
  apartItems: ApartItem[];
}
