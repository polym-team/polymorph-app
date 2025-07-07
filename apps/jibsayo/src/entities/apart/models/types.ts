export interface ApartItem {
  apartName: string;
  address: string;
}

export interface FavoriteApartItem {
  regionCode: string;
  apartItems: ApartItem[];
}

// 서버용 타입 (DB와 동일)
export interface ServerFavoriteApart {
  id?: string;
  regionCode: string;
  address: string;
  apartName: string;
  deviceId: string;
  createdAt: Date;
  updatedAt: Date;
}

// 로컬스토리지용 타입 (필요한 필드만)
export interface LocalFavoriteApart {
  regionCode: string;
  address: string;
  apartName: string;
}
