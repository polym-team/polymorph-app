import {
  AdminFirestoreClient,
  ExpoPushNotificationClient,
} from '@polymorph/firebase';

import admin from 'firebase-admin';
import { NextRequest, NextResponse } from 'next/server';

import { COLLECTIONS } from '../consts';
import { validateToken } from '../push-token/utils';
import { obfuscateKorean } from '../utils';

interface TransactionData {
  apartId: string;
  apartName: string;
  buildedYear: number | null;
  householdsNumber: number | null;
  address: string;
  tradeDate: string;
  size: number | null;
  floor: number | null;
  isNewRecord: boolean;
  tradeAmount: number;
  maxTradeAmount: number;
}

interface FavoriteApart {
  id?: string;
  regionCode: string;
  address: string;
  apartName: string;
  deviceId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface PushNotificationData {
  deviceId: string;
  message: string;
  apartName: string;
  regionCode: string;
  transactionCount: number;
  transactions: TransactionData[];
}

// Expo Push Notification Client 초기화

// Firebase Admin SDK 초기화 (FCM용)
let firebaseApp: admin.app.App;

if (!admin.apps.length) {
  firebaseApp = admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKeyId: process.env.FIREBASE_PRIVATE_KEY_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      clientId: process.env.FIREBASE_CLIENT_ID,
    } as any),
  });
} else {
  firebaseApp = admin.app();
}
const expoPushClient = new ExpoPushNotificationClient();

// Firestore Admin 클라이언트 초기화 (즐겨찾기 아파트용)
const firestoreClient = new AdminFirestoreClient({
  collectionName: COLLECTIONS.FAVORITE_APART,
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

// Firestore Admin 클라이언트 초기화 (푸시 토큰용)
const pushTokenClient = new AdminFirestoreClient({
  collectionName: COLLECTIONS.PUSH_TOKEN,
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

// Firestore Admin 클라이언트 초기화 (API 호출 제한용)
const rateLimitClient = new AdminFirestoreClient({
  collectionName: COLLECTIONS.API_RATE_LIMIT,
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

// Firestore 데이터를 FavoriteApart 타입으로 변환
function mapFirestoreToFavoriteApart(doc: any): FavoriteApart {
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

// API 호출 제한 확인 및 업데이트 함수
async function checkAndUpdateRateLimit(testKey?: string): Promise<boolean> {
  try {
    // 테스트 키가 있고 환경 변수와 일치하면 제한 없이 허용
    if (testKey && testKey === process.env.PUSH_API_TEST_KEY) {
      console.log('🔑 테스트 키로 호출 제한 우회');
      return true;
    }

    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD 형식
    const rateLimitDocId = `push-api-${today}`;

    // 오늘 날짜의 호출 기록 조회
    const rateLimitDoc = await rateLimitClient.getDocument(rateLimitDocId);

    if (rateLimitDoc) {
      // 이미 오늘 호출된 경우
      console.log(`⚠️ 오늘 이미 호출됨: ${today}`);
      return false;
    }

    // 오늘 첫 호출인 경우, 호출 기록 생성
    await rateLimitClient.createDocumentWithId(rateLimitDocId, {
      lastCalledAt: new Date(),
      createdAt: new Date(),
    });

    console.log(`✅ 오늘 첫 호출 기록 생성: ${today}`);
    return true;
  } catch (error) {
    console.error('❌ 호출 제한 확인 중 에러:', error);
    return false; // 에러 발생 시 호출 차단
  }
}

// 특정 지역의 신규 거래 데이터를 가져오는 함수
async function getNewTransactionsByArea(
  area: string
): Promise<TransactionData[]> {
  try {
    const url = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/new-transactions?area=${area}`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Internal-API-Call',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.list || [];
  } catch (error) {
    console.error(`Error fetching new transactions for area ${area}:`, error);
    return [];
  }
}

// 푸시 알림 전송 함수 (Expo Push Notification Service 사용)
async function sendPushNotification(
  deviceId: string,
  message: string,
  regionCode: string,
  apartName: string
): Promise<boolean> {
  try {
    // Firestore에서 토큰 조회 (문서 ID로 직접 조회)
    const tokenDoc = await pushTokenClient.getDocument(deviceId);

    if (!tokenDoc) {
      console.error(`❌ 토큰을 찾을 수 없습니다: ${deviceId}`);
      return false;
    }

    const token = tokenDoc.data?.token;

    if (!token) {
      console.error(`❌ 토큰이 없습니다: ${deviceId}`);
      return false;
    }

    console.log(
      `🎫 토큰 조회 성공: ${deviceId} - ${token.substring(0, 20)}...`
    );

    // 토큰 유효성 검사
    if (!validateToken(token)) {
      console.error(
        `❌ 유효하지 않은 토큰: ${deviceId} - ${token.substring(0, 20)}...`
      );
      return false;
    }

    // Expo Push Notification Service를 사용하여 전송
    const result = await expoPushClient.sendToDevice(token, {
      title: '새로운 아파트 거래',
      body: message,
      data: {
        action: 'gotoUrl',
        screen: 'home',
        url: `https://jibsayo.vercel.app/aparts/${regionCode}/${encodeURIComponent(apartName)}`,
      },
    });

    if (result.success) {
      console.log(`✅ Expo 푸시 전송 성공: ${deviceId}`);
      return true;
    } else {
      console.error(`❌ Expo 푸시 전송 실패: ${deviceId} - ${result.error}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Expo 푸시 전송 에러: ${deviceId} - ${error}`);
    return false;
  }
}
export async function POST(request: NextRequest) {
  try {
    // 프로덕션 환경에서만 User-Agent 검증
    if (process.env.NODE_ENV === 'production') {
      const userAgent = request.headers.get('user-agent');
      const isVercelCron =
        userAgent?.includes('Vercel') || userAgent?.includes('cron');

      if (!isVercelCron) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    console.log('🔍 즐겨찾기 기반 푸시 알림 처리 시작...');

    // 0. API 호출 제한 확인 (테스트 키 포함)
    const { searchParams } = new URL(request.url);
    const testKey = searchParams.get('test_key');
    const canProceed = await checkAndUpdateRateLimit(testKey || undefined);
    if (!canProceed) {
      return NextResponse.json({
        success: false,
        message: '오늘 이미 호출되었습니다. 하루에 한 번만 호출 가능합니다.',
        scrapedAt: new Date().toISOString(),
      });
    }

    // 1. Firestore에서 모든 favorite-apart 데이터 가져오기
    const favoriteDocuments = await firestoreClient.getDocuments({});
    const favoriteAparts = favoriteDocuments.map(doc =>
      mapFirestoreToFavoriteApart(doc)
    );

    console.log(`📋 총 ${favoriteAparts.length}개의 즐겨찾기 아파트 발견`);

    if (favoriteAparts.length === 0) {
      return NextResponse.json({
        success: true,
        message: '즐겨찾기된 아파트가 없습니다.',
        pushNotifications: [],
        summary: {
          totalFavorites: 0,
          totalRegions: 0,
          totalTransactions: 0,
          totalPushNotifications: 0,
        },
        scrapedAt: new Date().toISOString(),
      });
    }

    // 2. regionCode 목록 취합 (중복 제거)
    const uniqueRegionCodes = Array.from(
      new Set(favoriteAparts.map(fav => fav.regionCode))
    );
    console.log(`🗺️  크롤링할 지역 코드: ${uniqueRegionCodes.join(', ')}`);

    // 3. 각 regionCode별로 신규 거래 데이터 가져오기
    const allTransactions: TransactionData[] = [];

    for (const regionCode of uniqueRegionCodes) {
      try {
        console.log(`🕷️  지역 ${regionCode} 신규 거래 조회 중...`);
        const transactions = await getNewTransactionsByArea(regionCode);
        allTransactions.push(...transactions);
        console.log(
          `✅ 지역 ${regionCode}: ${transactions.length}개 거래 발견`
        );

        // 요청 간격 조절 (서버 부하 방지)
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`❌ 지역 ${regionCode} 신규 거래 조회 실패:`, error);
      }
    }

    console.log(
      `📊 총 ${allTransactions.length}개의 신규 거래 데이터 수집 완료`
    );

    // 4. 아파트별로 매칭되는 신규 거래 찾기 및 푸시 데이터 생성
    const pushNotifications: PushNotificationData[] = [];
    const sentSet = new Set<string>(); // deviceId|apartName 중복 방지

    // 각 즐겨찾기 아파트별로 매칭 확인
    for (const favorite of favoriteAparts) {
      const key = `${favorite.deviceId}|${favorite.apartName}`;
      if (sentSet.has(key)) continue; // 중복 방지

      // 해당 아파트와 매칭되는 거래 찾기
      const matchedTransactions = allTransactions.filter(transaction => {
        const regionMatch = transaction.apartId.includes(
          obfuscateKorean(favorite.regionCode)
        );
        const addressMatch = transaction.apartId.includes(
          obfuscateKorean(favorite.address)
        );
        const apartNameMatch = transaction.apartId.includes(
          obfuscateKorean(favorite.apartName)
        );
        return regionMatch && addressMatch && apartNameMatch;
      });

      if (matchedTransactions.length > 0) {
        const message = `${favorite.apartName}에 ${matchedTransactions.length}건의 신규 거래가 있습니다.`;
        pushNotifications.push({
          deviceId: favorite.deviceId,
          message,
          apartName: favorite.apartName,
          regionCode: favorite.regionCode,
          transactionCount: matchedTransactions.length,
          transactions: matchedTransactions,
        });
        sentSet.add(key);
        console.log(
          `✅✅✅✅✅ 푸시 알람을 전송합니다. (deviceId: ${favorite.deviceId}, apartName: ${favorite.apartName}, 거래수: ${matchedTransactions.length}건)`
        );
      } else {
        console.log(
          `⚠️  매칭되는 거래 없음: ${favorite.apartName} (deviceId: ${favorite.deviceId})`
        );
      }
    }

    const totalPushNotifications = pushNotifications.length;

    // 5. 실제 푸시 알림 전송
    console.log(`📱 ${totalPushNotifications}개 푸시 알림 전송 시작...`);

    const pushResults = await Promise.allSettled(
      pushNotifications.map(async pushData => {
        const success = await sendPushNotification(
          pushData.deviceId,
          pushData.message,
          pushData.regionCode,
          pushData.apartName
        );
        if (success) {
          console.log(
            `푸시 전송 성공: ${pushData.deviceId} - ${pushData.apartName}`
          );
        }
        return {
          deviceId: pushData.deviceId,
          success,
          message: pushData.message,
        };
      })
    );

    // 전송 결과 집계
    const successfulPushes = pushResults.filter(
      result => result.status === 'fulfilled' && result.value.success
    ).length;

    const failedPushes = totalPushNotifications - successfulPushes;

    console.log(
      `📊 푸시 전송 완료: 성공 ${successfulPushes}개, 실패 ${failedPushes}개`
    );

    return NextResponse.json({
      success: true,
      message: '푸시 알림 전송이 완료되었습니다.',
      pushResults: {
        total: totalPushNotifications,
        successful: successfulPushes,
        failed: failedPushes,
      },
      scrapedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ 푸시 알림 처리 에러:', error);
    return NextResponse.json(
      {
        error: '푸시 알림 처리 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
