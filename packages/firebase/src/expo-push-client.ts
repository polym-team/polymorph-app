import { Expo, ExpoPushMessage } from 'expo-server-sdk';

export interface ExpoPushNotificationPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
}

export interface ExpoPushNotificationResult {
  deviceId: string;
  success: boolean;
  message: string;
  error?: string;
}

export class ExpoPushNotificationClient {
  private expo: Expo;

  constructor() {
    this.expo = new Expo();
  }

  /**
   * 단일 디바이스에 푸시 알림 전송
   */
  async sendToDevice(
    deviceId: string,
    payload: ExpoPushNotificationPayload
  ): Promise<ExpoPushNotificationResult> {
    try {
      // deviceId를 Expo Push Token으로 사용
      const expoPushToken = deviceId;

      // Expo Push Token 형식 검증
      if (!Expo.isExpoPushToken(expoPushToken)) {
        return {
          deviceId,
          success: false,
          message: payload.body,
          error: '유효하지 않은 Expo Push Token입니다.',
        };
      }

      const message: ExpoPushMessage = {
        to: expoPushToken,
        sound: 'default',
        title: payload.title,
        body: payload.body,
        data: payload.data || {},
      };

      // 🚀 최종 전송 로그 - Expo client로 전달하는 데이터
      console.log('🚀 ===== EXPO CLIENT 최종 전송 =====');
      console.log(' 전송할 메시지 전체 구조:');
      console.log(JSON.stringify(message, null, 2));
      console.log('🚀 ===== EXPO CLIENT 전송 시작 =====');

      const chunks = this.expo.chunkPushNotifications([message]);
      const tickets = [];

      for (const chunk of chunks) {
        try {
          const ticketChunk = await this.expo.sendPushNotificationsAsync(chunk);
          tickets.push(...ticketChunk);
        } catch (error) {
          console.error('Expo 푸시 전송 에러:', error);
          return {
            deviceId,
            success: false,
            message: payload.body,
            error: error instanceof Error ? error.message : 'Unknown error',
          };
        }
      }

      // 티켓 결과 확인
      const receiptIds = tickets
        .filter(ticket => ticket.status === 'ok')
        .map(ticket => ticket.id);

      if (receiptIds.length > 0) {
        const receiptIdChunks =
          this.expo.chunkPushNotificationReceiptIds(receiptIds);
        const receipts = [];

        for (const chunk of receiptIdChunks) {
          try {
            const receiptChunk =
              await this.expo.getPushNotificationReceiptsAsync(chunk);
            // Object.values를 사용하여 배열로 변환
            receipts.push(...Object.values(receiptChunk));
          } catch (error) {
            console.error('Expo 영수증 조회 에러:', error);
          }
        }

        // 영수증 결과 확인
        for (const receipt of receipts) {
          if (receipt.status === 'error') {
            console.error('Expo 푸시 전송 실패:', receipt.message);
            return {
              deviceId,
              success: false,
              message: payload.body,
              error: receipt.message || 'Expo 푸시 전송 실패',
            };
          }
        }
      }

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
      payload: ExpoPushNotificationPayload;
    }>
  ): Promise<ExpoPushNotificationResult[]> {
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
}
