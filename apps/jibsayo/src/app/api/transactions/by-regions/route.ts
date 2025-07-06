import { AdminFirestoreClient } from '@polymorph/firebase';

import { NextRequest, NextResponse } from 'next/server';

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

// Firestore Admin 클라이언트 초기화
const firestoreClient = new AdminFirestoreClient({
  collectionName: 'favorite-apart',
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

export async function POST(request: NextRequest) {
  try {
    console.log(
      '🔍 즐겨찾기 지역 기반 거래 데이터 조회 및 푸시 알림 처리 시작...'
    );

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
        regions: [],
        transactions: {},
        summary: {
          totalFavorites: 0,
          totalRegions: 0,
          totalTransactions: 0,
        },
        scrapedAt: new Date().toISOString(),
      });
    }

    // 2. regionCode 목록 취합 (중복 제거)
    const uniqueRegionCodes = Array.from(
      new Set(favoriteAparts.map(fav => fav.regionCode))
    );
    console.log(`🗺️  조회할 지역 코드: ${uniqueRegionCodes.join(', ')}`);

    // 3. 각 regionCode별로 신규 거래 데이터 가져오기
    const transactionsByRegion: Record<string, TransactionData[]> = {};
    let totalTransactions = 0;

    for (const regionCode of uniqueRegionCodes) {
      try {
        console.log(`🕷️  지역 ${regionCode} 신규 거래 조회 중...`);
        const transactions = await getNewTransactionsByArea(regionCode);
        transactionsByRegion[regionCode] = transactions;
        totalTransactions += transactions.length;
        console.log(
          `✅ 지역 ${regionCode}: ${transactions.length}개 거래 발견`
        );

        // 요청 간격 조절 (서버 부하 방지)
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`❌ 지역 ${regionCode} 신규 거래 조회 실패:`, error);
        transactionsByRegion[regionCode] = [];
      }
    }

    console.log(`📊 총 ${totalTransactions}개의 거래 데이터 수집 완료`);

    // TODO: 여기에 실제 푸시 알림 전송 로직 추가
    // 예: Firebase Cloud Messaging, OneSignal 등
    console.log('📱 푸시 알림 전송 로직 실행 예정...');

    return NextResponse.json({
      success: true,
      regions: uniqueRegionCodes,
      transactions: transactionsByRegion,
      summary: {
        totalFavorites: favoriteAparts.length,
        totalRegions: uniqueRegionCodes.length,
        totalTransactions: totalTransactions,
      },
      scrapedAt: new Date().toISOString(),
      pushNotificationStatus: 'pending', // 푸시 알림 상태 추가
    });
  } catch (error) {
    console.error('❌ 거래 데이터 조회 에러:', error);
    return NextResponse.json(
      {
        error: '거래 데이터 조회 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
