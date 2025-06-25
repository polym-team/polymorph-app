import { FirestoreClient } from '@polymorph/firebase';

import { PushToken } from './types';

// Firestore 클라이언트 초기화
const firestoreClient = new FirestoreClient({
  collectionName: 'push-token',
  projectId: process.env.FIREBASE_PROJECT_ID,
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
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
