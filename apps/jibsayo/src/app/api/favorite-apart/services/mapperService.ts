import { FavoriteApart } from '../types';

// Firestore 데이터를 FavoriteApart 타입으로 변환
export function mapFirestoreToFavoriteApart(doc: any): FavoriteApart {
  return {
    id: doc.id,
    apartToken: doc.data.apartToken,
    regionCode: doc.data.regionCode,
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
    apartToken: favoriteApart.apartToken,
    regionCode: favoriteApart.regionCode,
    apartName: favoriteApart.apartName,
    deviceId: favoriteApart.deviceId,
    createdAt: now,
    updatedAt: now,
  };
}
