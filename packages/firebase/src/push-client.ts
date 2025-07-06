import admin from 'firebase-admin';

export interface PushNotificationPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
}

export interface PushNotificationResult {
  deviceId: string;
  success: boolean;
  message: string;
  error?: string;
}

export interface FcmTokenMapping {
  deviceId: string;
  fcmToken: string;
  createdAt: Date;
  updatedAt: Date;
}

export class PushNotificationClient {
  private app: admin.app.App;
  private firestore: admin.firestore.Firestore;
  private tokenCollectionName: string;

  constructor(
    serviceAccount: {
      projectId: string;
      privateKeyId: string;
      privateKey: string;
      clientEmail: string;
      clientId: string;
    },
    tokenCollectionName: string = 'fcm-tokens' // 기본값
  ) {
    // Firebase Admin 초기화 (이미 초기화되어 있지 않은 경우에만)
    if (!admin.apps.length) {
      this.app = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as any),
      });
    } else {
      this.app = admin.app();
    }

    this.firestore = this.app.firestore();
    this.tokenCollectionName = tokenCollectionName;
  }

  /**
   * 단일 디바이스에 푸시 알림 전송
   */
  async sendToDevice(
    deviceId: string,
    payload: PushNotificationPayload
  ): Promise<PushNotificationResult> {
    try {
      // FCM 토큰을 가져오는 로직
      const fcmToken = await this.getFcmTokenFromDeviceId(deviceId);

      if (!fcmToken) {
        return {
          deviceId,
          success: false,
          message: payload.body,
          error: 'FCM 토큰을 찾을 수 없습니다.',
        };
      }

      const messagePayload = {
        notification: {
          title: payload.title,
          body: payload.body,
        },
        data: payload.data || {},
        token: fcmToken,
      };

      const response = await this.app.messaging().send(messagePayload);

      return {
        deviceId,
        success: true,
        message: payload.body,
      };
    } catch (error) {
      return {
        deviceId,
        success: false,
        message: payload.body,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * 여러 디바이스에 푸시 알림 전송
   */
  async sendToMultipleDevices(
    notifications: Array<{
      deviceId: string;
      payload: PushNotificationPayload;
    }>
  ): Promise<PushNotificationResult[]> {
    const results = await Promise.allSettled(
      notifications.map(async ({ deviceId, payload }) => {
        return await this.sendToDevice(deviceId, payload);
      })
    );

    return results.map(result => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          deviceId: 'unknown',
          success: false,
          message: 'Unknown',
          error: result.reason?.message || 'Unknown error',
        };
      }
    });
  }

  /**
   * deviceId로 FCM 토큰을 가져오는 메서드
   * Firestore의 'push-token' 컬렉션에서 조회
   */
  private async getFcmTokenFromDeviceId(
    deviceId: string
  ): Promise<string | null> {
    try {
      console.log(`🔍 FCM 토큰 조회 중... (deviceId: ${deviceId})`);

      const tokenDoc = await this.firestore
        .collection(this.tokenCollectionName)
        .doc(deviceId)
        .get();

      console.log(`📄 문서 존재 여부: ${tokenDoc.exists}`);

      if (tokenDoc.exists) {
        const data = tokenDoc.data();
        console.log(`📋 문서 데이터:`, data);
        const token = data?.token || null;
        console.log(`🎫 FCM 토큰: ${token ? '발견됨' : '없음'}`);
        return token;
      }

      console.log(`❌ 문서가 존재하지 않음 (deviceId: ${deviceId})`);
      return null;
    } catch (error) {
      console.error(`FCM 토큰 조회 실패 (deviceId: ${deviceId}):`, error);
      return null;
    }
  }

  /**
   * FCM 토큰 저장/업데이트
   */
  async saveFcmToken(deviceId: string, fcmToken: string): Promise<void> {
    try {
      await this.firestore
        .collection(this.tokenCollectionName)
        .doc(deviceId)
        .set({
          deviceId,
          token: fcmToken,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
    } catch (error) {
      console.error(`FCM 토큰 저장 실패 (deviceId: ${deviceId}):`, error);
      throw error;
    }
  }

  /**
   * FCM 토큰 삭제
   */
  async deleteFcmToken(deviceId: string): Promise<void> {
    try {
      await this.firestore
        .collection(this.tokenCollectionName)
        .doc(deviceId)
        .delete();
    } catch (error) {
      console.error(`FCM 토큰 삭제 실패 (deviceId: ${deviceId}):`, error);
      throw error;
    }
  }
}
