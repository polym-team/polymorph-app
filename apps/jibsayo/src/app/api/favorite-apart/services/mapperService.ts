import { FavoriteApart } from '../models/types';

// Firestore 데이터를 FavoriteApart 타입으로 변환
export function mapFirestoreToFavoriteApart(doc: any): FavoriteApart {
  return {
    id: doc.id,
    apartId: doc.data.apartId,
    regionCode: doc.data.regionCode,
    address: doc.data.address,
    apartName: doc.data.apartName,
    deviceId: doc.data.deviceId,
    createdAt: doc.data.createdAt?.toDate() || new Date(),
    updatedAt: doc.data.updatedAt?.toDate() || new Date(),
  };
}

// FavoriteApart를 Firestore 데이터로 변환
export function mapFavoriteApartToFirestore(
  favoriteApart: Omit<FavoriteApart, 'createdAt' | 'updatedAt'>
): Record<string, unknown> {
  const now = new Date();
  return {
    apartId: favoriteApart.apartId,
    regionCode: favoriteApart.regionCode,
    address: favoriteApart.address,
    apartName: favoriteApart.apartName,
    deviceId: favoriteApart.deviceId,
    createdAt: now,
    updatedAt: now,
  };
}
