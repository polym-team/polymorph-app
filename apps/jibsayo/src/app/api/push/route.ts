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

export async function GET(request: NextRequest) {
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
        deviceMatches: {},
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

    // 4. deviceId별로 즐겨찾기와 매칭되는 신규 거래 찾기
    const deviceMatches: Record<string, any[]> = {};

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

    // 각 디바이스별로 매칭 확인
    for (const [deviceId, favorites] of Object.entries(favoritesByDevice)) {
      const matches: any[] = [];

      for (const favorite of favorites) {
        // 아파트명이 일치하는 거래 찾기 (부분 매칭)
        const matchedTransactions = allTransactions.filter(transaction => {
          const apartNameMatch =
            transaction.apartName.includes(favorite.apartName) ||
            favorite.apartName.includes(transaction.apartName);
          // regionCode는 apartId에 포함되어 있으므로 apartId로 매칭
          const regionMatch = transaction.apartId.includes(favorite.regionCode);

          return apartNameMatch && regionMatch;
        });

        if (matchedTransactions.length > 0) {
          matches.push({
            favoriteApart: {
              apartName: favorite.apartName,
              address: favorite.address,
              regionCode: favorite.regionCode,
            },
            newTransactions: matchedTransactions,
          });
        }
      }

      if (matches.length > 0) {
        deviceMatches[deviceId] = matches;

        // Console 출력
        console.log(`\n🎯 디바이스 ${deviceId}의 즐겨찾기 매칭 결과:`);
        matches.forEach(match => {
          console.log(
            `  📍 ${match.favoriteApart.apartName} (${match.favoriteApart.regionCode})`
          );
          console.log(
            `     → ${match.newTransactions.length}개의 신규 거래 발견`
          );
          match.newTransactions.forEach((tx: TransactionData) => {
            console.log(
              `       • ${tx.tradeDate} | ${tx.floor}층 | ${tx.size}㎡ | ${(tx.tradeAmount / 100000000).toFixed(1)}억원`
            );
          });
        });
      }
    }

    const totalMatches = Object.keys(deviceMatches).length;
    console.log(`\n🏆 총 ${totalMatches}개 디바이스에서 즐겨찾기 매칭 완료!`);

    // TODO: 여기에 실제 푸시 알림 전송 로직 추가
    // 예: Firebase Cloud Messaging, OneSignal 등

    return NextResponse.json({
      success: true,
      summary: {
        totalFavorites: favoriteAparts.length,
        totalRegions: uniqueRegionCodes.length,
        totalTransactions: allTransactions.length,
        matchedDevices: totalMatches,
      },
      deviceMatches,
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
