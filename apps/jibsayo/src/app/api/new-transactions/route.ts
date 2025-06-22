import * as cheerio from 'cheerio';
import { NextRequest, NextResponse } from 'next/server';

interface TransactionData {
  apartName: string;
  transactionPrice: number;
  tradeDate: string;
  floor: number;
  area: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const area = searchParams.get('area');

    if (!area) {
      return NextResponse.json(
        { error: 'area 파라미터가 필요합니다.' },
        { status: 400 }
      );
    }

    const url = `https://apt2.me/apt/AptDaily.jsp?area=${area}`;

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

    return NextResponse.json({
      success: true,
      area: area,
      totalCount: transactions.length,
      transactions: transactions,
      scrapedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('크롤링 에러:', error);
    return NextResponse.json(
      {
        error: '크롤링 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
