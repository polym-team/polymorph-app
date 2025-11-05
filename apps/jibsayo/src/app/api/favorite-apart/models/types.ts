export interface FavoriteApart {
  id?: string;
  apartId: string;
  regionCode: string;
  address: string;
  apartName: string;
  deviceId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateFavoriteApartRequest {
  regionCode: string;
  apartId: string;
  address: string;
  apartName: string;
  deviceId: string;
}

export interface FavoriteApartResponse {
  success: boolean;
  data?: FavoriteApart;
  error?: string;
}

export interface FavoriteApartListResponse {
  success: boolean;
  data?: FavoriteApart[];
  error?: string;
}

export interface DeleteFavoriteApartResponse {
  success: boolean;
  error?: string;
}
