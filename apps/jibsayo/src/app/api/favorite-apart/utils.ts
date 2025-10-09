import { AdminFirestoreClient } from '@polymorph/firebase';

import { FavoriteApart } from './types';

// Firestore Admin 클라이언트 초기화 (서버 사이드용)
const firestoreClient = new AdminFirestoreClient({
  collectionName: 'favorite-apart',
  projectId: process.env.FIREBASE_PROJECT_ID,
  // 서비스 계정 정보 (환경변수에서 읽기)
  serviceAccount: {
    type: 'service_account',
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    token_uri: 'https://oauth2.googleapis.com/token',
    auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
    client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
  } as any,
});

export { firestoreClient };

// Firestore 데이터를 FavoriteApart 타입으로 변환
export function mapFirestoreToFavoriteApart(doc: any): FavoriteApart {
  return {
    id: doc.id,
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
): any {
  const now = new Date();
  return {
    id: favoriteApart.id,
    regionCode: favoriteApart.regionCode,
    address: favoriteApart.address,
    apartName: favoriteApart.apartName,
    deviceId: favoriteApart.deviceId,
    createdAt: now,
    updatedAt: now,
  };
}

// 디바이스 ID와 아파트 정보로 기존 즐겨찾기 찾기
export async function findExistingFavoriteApart(
  itemId: string,
  deviceId: string
): Promise<FavoriteApart | null> {
  try {
    const documents = await firestoreClient.getDocuments({
      where: [
        { field: 'deviceId', operator: '==', value: deviceId },
        { field: 'id', operator: '==', value: itemId },
      ],
    });

    if (documents.length > 0) {
      return mapFirestoreToFavoriteApart(documents[0]);
    }
    return null;
  } catch (error) {
    console.error('Error finding existing favorite apart:', error);
    return null;
  }
}

// 유효성 검사 함수들
export function validateDeviceId(deviceId: string): boolean {
  return Boolean(deviceId && deviceId.length > 0);
}

export function validateRegionCode(regionCode: string): boolean {
  return Boolean(regionCode && regionCode.length > 0);
}

export function validateAddress(address: string): boolean {
  return Boolean(address && address.length > 0);
}

export function validateApartName(apartName: string): boolean {
  return Boolean(apartName && apartName.length > 0);
}

// 즐겨찾기 아파트 데이터 유효성 검사
export function validateFavoriteApartData(data: {
  regionCode: string;
  address: string;
  apartName: string;
  deviceId: string;
}): { isValid: boolean; error?: string } {
  if (!validateDeviceId(data.deviceId)) {
    return { isValid: false, error: '유효한 디바이스 ID가 필요합니다.' };
  }

  if (!validateRegionCode(data.regionCode)) {
    return { isValid: false, error: '지역 코드가 필요합니다.' };
  }

  if (!validateAddress(data.address)) {
    return { isValid: false, error: '주소가 필요합니다.' };
  }

  if (!validateApartName(data.apartName)) {
    return { isValid: false, error: '아파트명이 필요합니다.' };
  }

  return { isValid: true };
}
