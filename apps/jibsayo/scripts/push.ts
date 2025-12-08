/**
 * GitHub Actions용 푸시 알림 스크립트
 * 유저의 즐겨찾기 아파트 기준 신규 거래 데이터 확인 후 푸시 알림 전송
 */
import { FavoriteApart } from '@/app/api/favorite-apart/types';
import {
  AdminFirestoreClient,
  ExpoPushNotificationClient,
} from '@polymorph/firebase';

import * as dotenv from 'dotenv';

import { COLLECTIONS } from '../src/app/api/shared/consts/firestoreCollection';
import { parseTransactionId } from '../src/app/api/shared/services/transaction/service';
import { ROUTE_PATH } from '../src/shared/consts/route';

// .env.local 파일 로드 (로컬 실행 시)
dotenv.config({ path: '.env.local' });

interface PushNotificationItem {
  deviceId: string;
  apartName: string;
  apartToken: string;
  transactionCount: number;
}

/**
 * Firestore 데이터를 FavoriteApart 타입으로 변환
 */
function mapFirestoreToFavoriteApart(doc: any): FavoriteApart {
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

/**
 * 신규 거래 데이터 조회
 */
async function getNewTransactionIdsByArea(area: string): Promise<string[]> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/new-transactions?area=${area}`,
      {
        cache: 'no-store',
        headers: { 'User-Agent': 'Internal-Script-Call' },
      }
    );
    const data = await response.json();
    return data.transactionIds;
  } catch (error) {
    console.error(`신규 거래 데이터 조회 실패: ${area}`, error);
    return [];
  }
}

/**
 * 토큰 유효성 검사
 */
function validateToken(token: string): boolean {
  if (!token || token.length === 0) return false;

  // Exponent Push Token 검증
  if (token.startsWith('ExponentPushToken[') && token.endsWith(']')) {
    const tokenContent = token.slice(18, -1);
    if (tokenContent.length >= 20) return true;
    return false;
  }

  // Firebase FCM 토큰 검증
  if (token.length >= 140) return true;

  // 테스트/더미 토큰 제외
  if (
    token.includes('example') ||
    token.includes('test') ||
    token.includes('dummy')
  ) {
    return false;
  }

  return false;
}

/**
 * 푸시 알림 전송
 */
async function sendPushNotification(
  expoPushClient: ExpoPushNotificationClient,
  pushTokenClient: AdminFirestoreClient,
  deviceId: string,
  transactionCount: number,
  apartName: string,
  apartToken: string
): Promise<boolean> {
  try {
    const pushTitle = '새로운 아파트 거래';
    const pushBody = `${apartName} 아파트에 ${transactionCount}건의 신규 거래가 있습니다.`;
    const pushData = {
      action: 'gotoUrl',
      screen: 'modal',
      tabName: 'saved',
      url: `https://jibsayo.vercel.app/${ROUTE_PATH.APART}/${apartToken}`,
    };

    // Firestore에서 토큰 조회
    const tokenDoc = await pushTokenClient.getDocument(deviceId);
    const token = tokenDoc?.data?.token;

    if (!token) {
      console.error(`토큰 획득 실패: ${deviceId}`);
      return false;
    }

    // 토큰 유효성 검사
    if (!validateToken(token)) {
      console.error(`유효하지 않은 토큰: ${deviceId}`);
      return false;
    }

    // Expo Push Notification 전송
    const result = await expoPushClient.sendToDevice(token, {
      title: pushTitle,
      body: pushBody,
      data: pushData,
    });

    return result.success;
  } catch (error) {
    console.error(`푸시 알림 전송 실패: ${deviceId}`, error);
    return false;
  }
}

/**
 * 메인 실행 함수
 */
async function main(): Promise<void> {
  const startTime = Date.now();
  console.log('🚀 Push notification job started at', new Date().toISOString());

  // 환경변수 검증
  let privateKey = process.env.FIREBASE_PRIVATE_KEY || '';
  if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
    privateKey = privateKey.slice(1, -1);
  }
  privateKey = privateKey.replace(/\\n/g, '\n');

  const serviceAccount = {
    type: 'service_account',
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: privateKey,
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    token_uri: 'https://oauth2.googleapis.com/token',
    auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
    client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
    universe_domain: 'googleapis.com',
  };

  if (
    !serviceAccount.project_id ||
    !serviceAccount.private_key ||
    !serviceAccount.client_email
  ) {
    throw new Error('Required Firebase environment variables are not set');
  }

  if (!process.env.NEXT_PUBLIC_BASE_URL) {
    throw new Error('NEXT_PUBLIC_BASE_URL environment variable is not set');
  }

  // Firestore 클라이언트 초기화
  const favoriteApartClient = new AdminFirestoreClient({
    serviceAccount,
    collectionName: COLLECTIONS.FAVORITE_APART,
  });

  const pushTokenClient = new AdminFirestoreClient({
    serviceAccount,
    collectionName: COLLECTIONS.PUSH_TOKEN,
  });

  const expoPushClient = new ExpoPushNotificationClient();

  try {
    // 1. Firestore에서 모든 favorite-apart 데이터 가져오기
    console.log('\n📋 Step 1: Fetching favorite apartments...');
    const favoriteDocuments = await favoriteApartClient.getDocuments({});
    const favoriteAparts = favoriteDocuments.map(doc =>
      mapFirestoreToFavoriteApart(doc)
    );

    if (favoriteAparts.length === 0) {
      console.log('ℹ️  No favorite apartments found.');
      console.log('\n✅ Job completed: Nothing to process');
      return;
    }
    console.log(`✅ Found ${favoriteAparts.length} favorite apartments`);

    // 2. regionCode 목록 취합 (중복 제거)
    console.log('\n📋 Step 2: Extracting unique region codes...');
    const uniqueRegionCodes = Array.from(
      new Set(favoriteAparts.map(fav => fav.regionCode))
    );
    console.log(
      `✅ Found ${uniqueRegionCodes.length} unique region codes:`,
      uniqueRegionCodes
    );

    // 3. 각 regionCode별로 신규 거래 데이터 가져오기
    console.log('\n📋 Step 3: Fetching new transactions...');
    const results = await Promise.allSettled(
      uniqueRegionCodes.map(regionCode =>
        getNewTransactionIdsByArea(regionCode)
      )
    );
    const allTransactionIds = results
      .filter(result => result.status === 'fulfilled')
      .flatMap(result => result.value);

    if (allTransactionIds.length === 0) {
      console.log('ℹ️  No new transactions found.');
      console.log('\n✅ Job completed: No new transactions');
      return;
    }
    console.log(`✅ Found ${allTransactionIds.length} new transactions`);

    // 4. 푸시 알림 데이터 생성
    console.log('\n📋 Step 4: Generating push notifications...');
    const pushNotifications: PushNotificationItem[] = [];
    const sentSet = new Set<string>();

    for (const favorite of favoriteAparts) {
      const key = `${favorite.deviceId}|${favorite.apartName}`;
      if (sentSet.has(key)) continue;

      const matchedTransactions = allTransactionIds.filter(transactionId => {
        try {
          const parsedTransaction = parseTransactionId(transactionId);
          if (!parsedTransaction) return false;

          return favorite.apartToken === parsedTransaction.apartToken;
        } catch {
          return false;
        }
      });

      if (matchedTransactions.length > 0) {
        pushNotifications.push({
          deviceId: favorite.deviceId,
          apartName: favorite.apartName,
          apartToken: favorite.apartToken,
          transactionCount: matchedTransactions.length,
        });
        sentSet.add(key);
      }
    }

    if (pushNotifications.length === 0) {
      console.log('ℹ️  No matching transactions for user favorites.');
      console.log('\n✅ Job completed: No notifications to send');
      return;
    }
    console.log(`✅ Generated ${pushNotifications.length} push notifications`);

    // 5. 푸시 알림 전송
    console.log('\n📋 Step 5: Sending push notifications...');
    const pushResults = await Promise.allSettled(
      pushNotifications.map(async pushData => {
        const success = await sendPushNotification(
          expoPushClient,
          pushTokenClient,
          pushData.deviceId,
          pushData.transactionCount,
          pushData.apartName,
          pushData.apartToken
        );

        return { success, deviceId: pushData.deviceId };
      })
    );

    const successCount = pushResults.filter(
      result => result.status === 'fulfilled' && result.value.success
    ).length;
    const failureCount = pushNotifications.length - successCount;

    const duration = Date.now() - startTime;

    // 최종 결과 출력
    console.log('\n' + '='.repeat(60));
    console.log('✨ Push notification job completed');
    console.log('='.repeat(60));
    console.log(`📱 Total notifications: ${pushNotifications.length}`);
    console.log(`✅ Successfully sent: ${successCount}`);
    console.log(`❌ Failed: ${failureCount}`);
    console.log(`⏱️  Duration: ${(duration / 1000).toFixed(2)}s`);
    console.log('='.repeat(60));

    // 실패가 있으면 경고 (하지만 exit code는 0)
    if (failureCount > 0) {
      console.warn(
        `\n⚠️  Warning: ${failureCount} notifications failed to send`
      );
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('\n' + '='.repeat(60));
    console.error('💥 Push notification job failed');
    console.error('='.repeat(60));
    console.error(
      'Error:',
      error instanceof Error ? error.message : String(error)
    );
    console.error(`⏱️  Duration: ${(duration / 1000).toFixed(2)}s`);
    console.error('='.repeat(60));
    throw error;
  }
}

// 실행
main().catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
