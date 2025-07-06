import {
  AdminFirestoreClient,
  PushNotificationClient,
} from '@polymorph/firebase';

import { NextRequest, NextResponse } from 'next/server';

import { COLLECTIONS } from '../consts';
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

// PushNotificationClient 초기화 (jibsayo 전용 push-token 컬렉션 사용)
const pushClient = new PushNotificationClient(
  {
    projectId: process.env.FIREBASE_PROJECT_ID!,
    privateKeyId: process.env.FIREBASE_PRIVATE_KEY_ID!,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')!,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
    clientId: process.env.FIREBASE_CLIENT_ID!,
  },
  COLLECTIONS.PUSH_TOKEN // jibsayo 전용 컬렉션명
);

// Firestore Admin 클라이언트 초기화
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

// 푸시 알림 전송 함수 (packages/firebase 사용)
async function sendPushNotification(
  deviceId: string,
  message: string
): Promise<boolean> {
  try {
    const result = await pushClient.sendToDevice(deviceId, {
      title: '새로운 아파트 거래',
      body: message,
      data: {
        type: 'new_transaction',
        message: message,
      },
    });

    if (result.success) {
      console.log(`✅ 푸시 전송 성공: ${deviceId}`);
      return true;
    } else {
      console.error(`❌ 푸시 전송 실패: ${deviceId} - ${result.error}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ 푸시 전송 에러: ${deviceId} - ${error}`);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 즐겨찾기 기반 푸시 알림 처리 시작...');

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

    // 4. deviceId별로 즐겨찾기와 매칭되는 신규 거래 찾기 및 푸시 데이터 생성
    const pushNotifications: PushNotificationData[] = [];

    // deviceId별로 그룹화
    const favoritesByDevice = favoriteAparts.reduce(
      (acc, fav) => {
        if (!acc[fav.deviceId]) {
          acc[fav.deviceId] = [];
        }
        acc[fav.deviceId].push(fav);
        return acc;
      },
      {} as Record<string, FavoriteApart[]>
    );

    // 각 디바이스별로 매칭 확인 및 푸시 데이터 생성
    for (const [deviceId, favorites] of Object.entries(favoritesByDevice)) {
      const deviceTransactions: TransactionData[] = [];
      const matchedAparts: string[] = [];

      for (const favorite of favorites) {
        // apartId에 포함된 정보로 매칭 (regionCode, address, apartName)
        const matchedTransactions = allTransactions.filter(transaction => {
          // regionCode, address, apartName이 apartId에 모두 포함되어 있음
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
          deviceTransactions.push(...matchedTransactions);
          matchedAparts.push(favorite.apartName);
        }
      }

      if (deviceTransactions.length > 0) {
        // 아파트명을 쉼표로 구분하여 메시지 생성
        const apartNames = Array.from(new Set(matchedAparts)).join(', ');
        const message = `신규 거래가 있습니다. (${apartNames})`;

        pushNotifications.push({
          deviceId,
          message,
          apartName: apartNames,
          regionCode: favorites[0].regionCode, // 첫 번째 즐겨찾기의 regionCode 사용
          transactionCount: deviceTransactions.length,
          transactions: deviceTransactions,
        });

        console.log(
          `✅✅✅✅✅ 푸시 알람을 전송합니다. (deviceId: ${deviceId}, apartName: ${apartNames})`
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
          pushData.message
        );
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
