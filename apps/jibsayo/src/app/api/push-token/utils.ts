import { AdminFirestoreClient } from '@polymorph/firebase';

import { COLLECTIONS } from '../shared/consts/firestoreCollection';
import { PushToken } from './types';

// Firestore Admin 클라이언트 초기화 (서버 사이드용)
const firestoreClient = new AdminFirestoreClient({
  collectionName: COLLECTIONS.PUSH_TOKEN,
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

// Firestore 데이터를 PushToken 타입으로 변환
export function mapFirestoreToPushToken(doc: any): PushToken {
  return {
    id: doc.id, // 문서 ID가 deviceId와 동일
    token: doc.data.token,
    os: doc.data.os,
    osVersion: doc.data.osVersion,
    appVersion: doc.data.appVersion,
    notificationsEnabled: doc.data.notificationsEnabled,
    createdAt: doc.data.createdAt?.toDate() || new Date(),
    updatedAt: doc.data.updatedAt?.toDate() || new Date(),
  };
}

// PushToken을 Firestore 데이터로 변환
export function mapPushTokenToFirestore(
  pushToken: Omit<PushToken, 'id' | 'createdAt' | 'updatedAt'> & {
    deviceId: string;
  }
): any {
  const now = new Date();
  return {
    token: pushToken.token,
    os: pushToken.os,
    osVersion: pushToken.osVersion,
    appVersion: pushToken.appVersion,
    notificationsEnabled: pushToken.notificationsEnabled,
    createdAt: now,
    updatedAt: now,
  };
}

// 디바이스 ID로 기존 토큰 찾기 (문서 ID로 직접 조회)
export async function findExistingToken(
  deviceId: string
): Promise<PushToken | null> {
  try {
    const document = await firestoreClient.getDocument(deviceId);

    if (document) {
      return mapFirestoreToPushToken(document);
    }
    return null;
  } catch (error) {
    console.error('Error finding existing token:', error);
    return null;
  }
}

// 토큰 유효성 검사 (Exponent Push Token과 FCM 토큰 모두 지원)
export function validateToken(token: string): boolean {
  // 기본 검증
  if (!token || token.length === 0) {
    return false;
  }

  // Exponent Push Token 검증
  if (token.startsWith('ExponentPushToken[') && token.endsWith(']')) {
    const tokenContent = token.slice(18, -1); // ExponentPushToken[...] 안의 내용
    if (tokenContent.length >= 20) {
      console.log('✅ Exponent Push Token 형식 확인됨');
      return true;
    } else {
      console.warn(
        '⚠️  Exponent Push Token 내용이 너무 짧습니다:',
        tokenContent.length
      );
      return false;
    }
  }

  // Firebase FCM 토큰 검증
  if (token.length >= 140) {
    console.log('✅ Firebase FCM 토큰 형식 확인됨');
    return true;
  }

  // 테스트/더미 토큰인지 확인
  if (
    token.includes('example') ||
    token.includes('test') ||
    token.includes('dummy')
  ) {
    console.warn(
      '테스트/더미 토큰이 감지되었습니다:',
      token.substring(0, 20) + '...'
    );
    return false;
  }

  console.warn('⚠️  알 수 없는 토큰 형식:', token.substring(0, 20) + '...');
  return false;
}

// 디바이스 ID 유효성 검사
export function validateDeviceId(deviceId: string): boolean {
  return Boolean(deviceId && deviceId.length > 0);
}
