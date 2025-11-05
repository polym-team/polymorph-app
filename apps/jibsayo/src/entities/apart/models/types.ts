export interface FavoriteApartItem {
  apartId: string;
  regionCode: string;
  apartName: string;
  address: string;
}

export interface ServerFavoriteApart {
  id: string;
  regionCode: string;
  address: string;
  apartName: string;
  deviceId: string;
  createdAt: Date;
  updatedAt: Date;
}
