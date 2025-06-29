import { AdminFirestoreClient } from '@polymorph/firebase';

import * as cheerio from 'cheerio';
import { NextRequest, NextResponse } from 'next/server';

interface TransactionData {
  apartName: string;
  transactionPrice: number;
  tradeDate: string;
  floor: number;
  area: string;
  regionCode: string;
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

// 특정 지역의 거래 데이터를 크롤링하는 함수
async function crawlTransactionsByArea(
  regionCode: string
): Promise<TransactionData[]> {
  const url = `https://apt2.me/apt/AptDaily.jsp?area=${regionCode}`;

  const response = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      Accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      Connection: 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  const transactions: TransactionData[] = [];

  // 실거래 데이터가 있는 테이블을 찾습니다
  $('table').each((tableIndex, table) => {
    const $table = $(table);

    // 각 행을 순회합니다
    $table.find('tr').each((rowIndex, row) => {
      const $row = $(row);
      const $cells = $row.find('td');

      if ($cells.length >= 3) {
        const firstCellText = $cells.eq(0).text().trim();
        const secondCellText = $cells.eq(1).text().trim();
        const thirdCellText = $cells.eq(2).text().trim();

        // 첫 번째 셀이 단지명을 포함하고 있는지 확인 (실거래 데이터인지 판단)
        if (
          firstCellText &&
          firstCellText.length > 10 &&
          firstCellText.includes('년')
        ) {
          const transaction: TransactionData = {
            apartName: '',
            transactionPrice: 0,
            tradeDate: '',
            floor: 0,
            area: '',
            regionCode: regionCode,
          };

          // 단지명 추출 (예: "헬리오시티 2018년 (8년차) 9510세대 / 12,602대")
          const complexMatch = firstCellText.match(/^([^(]+)\s+(\d{4})년/);
          if (complexMatch) {
            transaction.apartName = complexMatch[1].trim();
          } else {
            // 다른 형식의 단지명 처리
            const simpleMatch = firstCellText.match(/^([^(]+)/);
            if (simpleMatch) {
              transaction.apartName = simpleMatch[1].trim();
            }
          }

          // 계약 정보 추출 (예: "25.05.28 10층 110.44㎡ 42B평 중개거래")
          const contractMatch = secondCellText.match(
            /(\d{2})\.(\d{2})\.(\d{2})\s+(\d+)층\s+([\d.]+)㎡/
          );
          if (contractMatch) {
            // 날짜 형식을 "2025-05-28" 형식으로 변환
            const year = '20' + contractMatch[1];
            const month = contractMatch[2];
            const day = contractMatch[3];
            transaction.tradeDate = `${year}-${month}-${day}`;

            // 층수를 숫자로 변환
            transaction.floor = parseInt(contractMatch[4]);

            transaction.area = contractMatch[5] + '㎡';
          }

          // 가격 정보 추출 (예: "30억(신) ↑ 9천 29억1천 103.0% 22억8천 ↑ 31.5%")
          const priceMatch = thirdCellText.match(/(\d+)억/);
          if (priceMatch) {
            const billion = parseInt(priceMatch[1]);
            transaction.transactionPrice = billion * 100000000; // 억 단위를 원 단위로 변환
          }

          // 유효한 데이터가 있는 경우만 추가
          if (transaction.apartName && transaction.transactionPrice > 0) {
            transactions.push(transaction);
          }
        }
      }
    });
  });

  return transactions;
}

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 즐겨찾기 기반 신규 거래 크롤링 시작...');

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

    // 3. 각 regionCode별로 크롤링 실행
    const allTransactions: TransactionData[] = [];

    for (const regionCode of uniqueRegionCodes) {
      try {
        console.log(`🕷️  지역 ${regionCode} 크롤링 중...`);
        const transactions = await crawlTransactionsByArea(regionCode);
        allTransactions.push(...transactions);
        console.log(
          `✅ 지역 ${regionCode}: ${transactions.length}개 거래 발견`
        );

        // 요청 간격 조절 (서버 부하 방지)
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`❌ 지역 ${regionCode} 크롤링 실패:`, error);
      }
    }

    console.log(`📊 총 ${allTransactions.length}개의 거래 데이터 수집 완료`);

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
          const regionMatch = transaction.regionCode === favorite.regionCode;

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
              `       • ${tx.tradeDate} | ${tx.floor}층 | ${tx.area} | ${(tx.transactionPrice / 100000000).toFixed(1)}억원`
            );
          });
        });
      }
    }

    const totalMatches = Object.keys(deviceMatches).length;
    console.log(`\n🏆 총 ${totalMatches}개 디바이스에서 즐겨찾기 매칭 완료!`);

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
    console.error('❌ 크롤링 에러:', error);
    return NextResponse.json(
      {
        error: '크롤링 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
