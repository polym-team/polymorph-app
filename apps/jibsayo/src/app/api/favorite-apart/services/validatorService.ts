import { FavoriteApart } from '../types';
import { firestoreClient } from './fireStoreService';
import { mapFirestoreToFavoriteApart } from './mapperService';

// FavoriteApart를 Firestore 데이터로 변환
export function mapFavoriteApartToFirestore(
  favoriteApart: Omit<FavoriteApart, 'createdAt' | 'updatedAt'>
): Record<string, unknown> {
  const now = new Date();
  return {
    regionCode: favoriteApart.regionCode,
    apartToken: favoriteApart.apartToken,
    apartName: favoriteApart.apartName,
    deviceId: favoriteApart.deviceId,
    createdAt: now,
    updatedAt: now,
  };
}

// 디바이스 ID와 아파트 정보로 기존 즐겨찾기 찾기
export async function findExistingFavoriteApart(
  apartToken: string,
  deviceId: string
): Promise<FavoriteApart | null> {
  try {
    const documents = await firestoreClient().getDocuments({
      where: [
        { field: 'deviceId', operator: '==', value: deviceId },
        { field: 'apartToken', operator: '==', value: apartToken },
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

export function validateApartToken(apartToken: string): boolean {
  return Boolean(apartToken && apartToken.length > 0);
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

// POST 요청 데이터 유효성 검사
export function validatePostRequestData(data: {
  deviceId: string;
  apartToken: string;
  regionCode: string;
  apartName: string;
}): { isValid: boolean; error?: string } {
  if (!validateDeviceId(data.deviceId)) {
    return { isValid: false, error: '유효한 디바이스 ID가 필요합니다.' };
  }

  if (!validateApartToken(data.apartToken)) {
    return { isValid: false, error: '유효한 아파트 토큰이 필요합니다.' };
  }

  if (!validateRegionCode(data.regionCode)) {
    return { isValid: false, error: '지역 코드가 필요합니다.' };
  }

  if (!validateApartName(data.apartName)) {
    return { isValid: false, error: '아파트명이 필요합니다.' };
  }

  return { isValid: true };
}

// DELETE 요청 데이터 유효성 검사
export function validateDeleteRequestData(data: {
  deviceId: string;
  apartToken: string;
}): { isValid: boolean; error?: string } {
  if (!validateDeviceId(data.deviceId)) {
    return { isValid: false, error: '유효한 디바이스 ID가 필요합니다.' };
  }

  if (!validateApartToken(data.apartToken)) {
    return { isValid: false, error: '유효한 아파트 토큰이 필요합니다.' };
  }

  return { isValid: true };
}
