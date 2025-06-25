import { AdminFirestoreClient } from '@polymorph/firebase';

import { PushToken } from './types';

// 환경변수 디버깅
console.log('Firebase 환경변수 확인:');
console.log(
  'FIREBASE_PROJECT_ID:',
  process.env.FIREBASE_PROJECT_ID ? '설정됨' : '설정안됨'
);
console.log(
  'FIREBASE_PRIVATE_KEY_ID:',
  process.env.FIREBASE_PRIVATE_KEY_ID ? '설정됨' : '설정안됨'
);
console.log(
  'FIREBASE_PRIVATE_KEY:',
  process.env.FIREBASE_PRIVATE_KEY ? '설정됨' : '설정안됨'
);
console.log(
  'FIREBASE_CLIENT_EMAIL:',
  process.env.FIREBASE_CLIENT_EMAIL ? '설정됨' : '설정안됨'
);
console.log(
  'FIREBASE_CLIENT_ID:',
  process.env.FIREBASE_CLIENT_ID ? '설정됨' : '설정안됨'
);
console.log(
  'FIREBASE_CLIENT_CERT_URL:',
  process.env.FIREBASE_CLIENT_CERT_URL ? '설정됨' : '설정안됨'
);

// Firestore Admin 클라이언트 초기화 (서버 사이드용)
const firestoreClient = new AdminFirestoreClient({
  collectionName: 'push-token',
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
    id: doc.id,
    deviceId: doc.data.deviceId,
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
  pushToken: Omit<PushToken, 'id' | 'createdAt' | 'updatedAt'>
): any {
  const now = new Date();
  return {
    deviceId: pushToken.deviceId,
    token: pushToken.token,
    os: pushToken.os,
    osVersion: pushToken.osVersion,
    appVersion: pushToken.appVersion,
    notificationsEnabled: pushToken.notificationsEnabled,
    createdAt: now,
    updatedAt: now,
  };
}

// 디바이스 ID로 기존 토큰 찾기
export async function findExistingToken(
  deviceId: string
): Promise<PushToken | null> {
  try {
    const documents = await firestoreClient.getDocuments({
      where: [{ field: 'deviceId', operator: '==', value: deviceId }],
    });

    if (documents.length > 0) {
      return mapFirestoreToPushToken(documents[0]);
    }
    return null;
  } catch (error) {
    console.error('Error finding existing token:', error);
    return null;
  }
}

// 토큰 유효성 검사
export function validateToken(token: string): boolean {
  return Boolean(token && token.length > 0);
}

// 디바이스 ID 유효성 검사
export function validateDeviceId(deviceId: string): boolean {
  return Boolean(deviceId && deviceId.length > 0);
}
