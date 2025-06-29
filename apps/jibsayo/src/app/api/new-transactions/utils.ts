import { AdminFirestoreClient } from '@polymorph/firebase';

// Push Token을 위한 Firestore 클라이언트
const pushTokenClient = new AdminFirestoreClient({
  collectionName: 'push-token',
  projectId: process.env.FIREBASE_PROJECT_ID,
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

interface PushToken {
  id?: string;
  deviceId: string;
  token: string;
  os: string;
  osVersion: string;
  appVersion: string;
  notificationsEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface TransactionData {
  apartName: string;
  transactionPrice: number;
  tradeDate: string;
  floor: number;
  area: string;
  regionCode: string;
}

// Firestore 데이터를 PushToken 타입으로 변환
function mapFirestoreToPushToken(doc: any): PushToken {
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

// deviceId로 푸시 토큰 찾기
export async function getPushTokenByDeviceId(
  deviceId: string
): Promise<PushToken | null> {
  try {
    const documents = await pushTokenClient.getDocuments({
      where: [
        { field: 'deviceId', operator: '==', value: deviceId },
        { field: 'notificationsEnabled', operator: '==', value: true },
      ],
    });

    if (documents.length > 0) {
      return mapFirestoreToPushToken(documents[0]);
    }
    return null;
  } catch (error) {
    console.error(`❌ deviceId ${deviceId}의 푸시 토큰 조회 실패:`, error);
    return null;
  }
}

// FCM 푸시 알림 발송
export async function sendPushNotification(
  token: string,
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<boolean> {
  try {
    // Firebase Admin SDK를 사용한 FCM 발송
    // 실제 구현에서는 firebase-admin을 import해서 사용
    console.log(`📱 푸시 알림 발송 (시뮬레이션):`);
    console.log(`   Token: ${token.substring(0, 20)}...`);
    console.log(`   Title: ${title}`);
    console.log(`   Body: ${body}`);
    console.log(`   Data:`, data);

    // TODO: 실제 FCM 발송 로직 구현
    // const message = {
    //   token: token,
    //   notification: {
    //     title: title,
    //     body: body,
    //   },
    //   data: data || {},
    //   android: {
    //     priority: 'high' as const,
    //   },
    //   apns: {
    //     headers: {
    //       'apns-priority': '10',
    //     },
    //   },
    // };
    //
    // const response = await admin.messaging().send(message);
    // console.log('✅ FCM 발송 성공:', response);

    return true;
  } catch (error) {
    console.error('❌ 푸시 알림 발송 실패:', error);
    return false;
  }
}

// 매칭된 거래에 대한 푸시 알림 발송
export async function sendNewTransactionNotifications(
  deviceMatches: Record<string, any[]>
): Promise<void> {
  console.log('📢 푸시 알림 발송 시작...');

  for (const [deviceId, matches] of Object.entries(deviceMatches)) {
    try {
      // 1. 디바이스의 푸시 토큰 조회
      const pushToken = await getPushTokenByDeviceId(deviceId);

      if (!pushToken) {
        console.log(
          `⚠️  디바이스 ${deviceId}: 푸시 토큰 없음 또는 알림 비활성화`
        );
        continue;
      }

      // 2. 매칭된 각 아파트별로 알림 발송
      for (const match of matches) {
        const { favoriteApart, newTransactions } = match;
        const transactionCount = newTransactions.length;

        // 알림 제목과 내용 생성
        const title = `🏠 ${favoriteApart.apartName} 신규 거래`;
        const body = `${transactionCount}건의 새로운 거래가 있습니다.`;

        // 추가 데이터 (앱에서 활용 가능)
        const notificationData = {
          type: 'new_transaction',
          apartName: favoriteApart.apartName,
          regionCode: favoriteApart.regionCode,
          transactionCount: transactionCount.toString(),
          deviceId: deviceId,
        };

        // 푸시 알림 발송
        const success = await sendPushNotification(
          pushToken.token,
          title,
          body,
          notificationData
        );

        if (success) {
          console.log(
            `✅ ${deviceId}: ${favoriteApart.apartName} 알림 발송 완료`
          );
        } else {
          console.log(
            `❌ ${deviceId}: ${favoriteApart.apartName} 알림 발송 실패`
          );
        }

        // 알림 간격 조절 (스팸 방지)
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } catch (error) {
      console.error(`❌ 디바이스 ${deviceId} 알림 처리 실패:`, error);
    }
  }

  console.log('📢 푸시 알림 발송 완료!');
}

// 거래 요약 메시지 생성
export function generateTransactionSummary(
  transactions: TransactionData[]
): string {
  if (transactions.length === 0) return '';

  const prices = transactions.map(t => t.transactionPrice / 100000000); // 억 단위
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  if (transactions.length === 1) {
    return `${prices[0].toFixed(1)}억원`;
  } else {
    return `${minPrice.toFixed(1)}억~${maxPrice.toFixed(1)}억원 (${transactions.length}건)`;
  }
}
