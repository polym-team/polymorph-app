import { createTransactionId } from '@/app/api/shared/services/transactionService';

import cheerio from 'cheerio';
import pLimit from 'p-limit';

import type {
  ApartmentTransaction,
  CrawlResult,
  ParsedPageResult,
} from '../models/types';

// 성능 최적화를 위한 상수 정의
const CONCURRENT_REQUESTS = 5;
const BATCH_SIZE = 5;
const REQUEST_TIMEOUT = 10000;
const MAX_RETRIES = 3;

// 동시 요청 수 제한
const limit = pLimit(CONCURRENT_REQUESTS);

// 정규표현식을 미리 컴파일하여 성능 최적화
const REGEXES = {
  whitespace: /^\s+|\s+$/gm,
  numbers: /[^0-9]/g,
  year: /(\d{4})년/,
  households: /(\d+)세대/,
  size: /(\d+(?:\.\d+)?)㎡/,
  floor: /(\d+)층/,
  newRecord: /\(신\)/,
  amount: /(\d+)억?\s*(\d+)?천?\s*(\d+)?만?/,
  date: /(\d{2})\.(\d{2})\.(\d{2})/,
  dong: /\S+동/,
} as const;

// 메모리 효율적인 문자열 처리
const optimizedSplitCellText = (text: string): string[] => {
  return text.replace(REGEXES.whitespace, '').split('\n').filter(Boolean);
};

// 한국어 금액 파싱 로직 개선
const parseAmount = (amountText: string): number => {
  if (!amountText) return 0;

  const cleanText = amountText.replace(REGEXES.newRecord, '').trim();
  let amount = 0;

  // 억 단위 처리
  const eokMatch = cleanText.match(/(\d+)억/);
  if (eokMatch) {
    amount += parseInt(eokMatch[1], 10) * 100_000_000;

    // 억 다음에 오는 부분 처리
    const afterEok = cleanText.replace(/\d+억\s*/, '');

    if (afterEok) {
      // "천"이 명시적으로 있는 경우 (예: "8억8천" = 8억 + 8천만)
      const cheonMatch = afterEok.match(/(\d+)천/);
      if (cheonMatch) {
        amount += parseInt(cheonMatch[1], 10) * 10_000_000;

        // 천 다음에 추가 숫자가 있는 경우 (예: "8억8천500" = 8억 + 8천만 + 500만)
        const afterCheon = afterEok.replace(/\d+천\s*/, '');
        if (afterCheon) {
          const manMatch = afterCheon.match(/(\d+)/);
          if (manMatch) {
            amount += parseInt(manMatch[1], 10) * 10_000;
          }
        }
      } else {
        // "천"이 없고 숫자만 있는 경우 만 단위로 처리 (예: "8억800" = 8억 + 800만)
        const manMatch = afterEok.match(/(\d+)/);
        if (manMatch) {
          amount += parseInt(manMatch[1], 10) * 10_000;
        }
      }
    }
  } else {
    // 억 단위가 없는 경우
    const cheonMatch = cleanText.match(/(\d+)천/);
    if (cheonMatch) {
      amount += parseInt(cheonMatch[1], 10) * 10_000_000;
    } else {
      // 만 단위만 있는 경우
      const manMatch = cleanText.match(/(\d+)/);
      if (manMatch) {
        amount += parseInt(manMatch[1], 10) * 10_000;
      }
    }
  }

  return amount;
};

// 날짜 파싱 최적화
const parseDate = (dateText: string): string => {
  const match = dateText.match(REGEXES.date);
  if (!match) return '';

  const [, year, month, day] = match;
  return `20${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
};

// 첫 번째 셀 데이터 파싱 최적화
const parseFirstCell = (
  cellText: string
): {
  apartName: string;
  buildedYear: number | null;
  householdsNumber: number | null;
  address: string;
} => {
  const lines = optimizedSplitCellText(cellText);
  const apartName = lines[0] || '';

  let buildedYear: number | null = null;
  let householdsNumber: number | null = null;
  let address = '';

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];

    if (!buildedYear) {
      const yearMatch = line.match(REGEXES.year);
      if (yearMatch) {
        buildedYear = parseInt(yearMatch[1], 10);
        continue;
      }
    }

    if (!householdsNumber) {
      const householdsMatch = line.match(REGEXES.households);
      if (householdsMatch) {
        householdsNumber = parseInt(householdsMatch[1], 10);
        continue;
      }
    }

    if (!address) {
      const dongMatch = line.match(REGEXES.dong);
      if (dongMatch) {
        address = line;
        break;
      }
    }
  }

  return {
    apartName,
    buildedYear,
    householdsNumber,
    address,
  };
};

// 두 번째 셀 데이터 파싱 최적화
const parseSecondCell = (
  cellText: string
): {
  tradeDate: string;
  size: number | null;
  floor: number | null;
} => {
  const lines = optimizedSplitCellText(cellText);

  const tradeDate = parseDate(lines[0] || '');

  let size: number | null = null;
  let floor: number | null = null;

  for (const line of lines) {
    if (!size) {
      const sizeMatch = line.match(REGEXES.size);
      if (sizeMatch) {
        size = parseFloat(sizeMatch[1]);
        continue;
      }
    }

    if (!floor) {
      const floorMatch = line.match(REGEXES.floor);
      if (floorMatch) {
        floor = parseInt(floorMatch[1], 10);
        continue;
      }
    }

    if (size && floor) break;
  }

  return {
    tradeDate,
    size,
    floor,
  };
};

// 세 번째 셀 데이터 파싱 최적화
const parseThirdCell = (
  cellText: string
): {
  isNewRecord: boolean;
  tradeAmount: number;
  maxTradeAmount: number;
} => {
  const lines = optimizedSplitCellText(cellText);
  const isNewRecord = REGEXES.newRecord.test(cellText);

  const tradeAmount = parseAmount(lines[0] || '');

  // maxTradeAmount는 %가 포함된 라인에서 추출
  // ↑나 ↓로 시작하는 라인은 상승/하락폭이므로 제외
  let maxTradeAmount = 0;
  for (const line of lines.slice(1)) {
    // ↑, ↓로 시작하는 라인은 건너뛰기
    if (line.startsWith('↑') || line.startsWith('↓')) {
      continue;
    }

    // %가 포함된 라인에서 금액 추출
    if (line.includes('%')) {
      maxTradeAmount = parseAmount(line);
      break;
    }

    // %가 없어도 금액이 있는 첫 번째 라인을 사용 (fallback)
    if (!maxTradeAmount && /\d+억|\d+천|\d+만/.test(line)) {
      maxTradeAmount = parseAmount(line);
    }
  }

  return {
    isNewRecord,
    tradeAmount,
    maxTradeAmount,
  };
};

// 행 데이터 파싱 최적화
const parseRowData = (row: any, area: string): ApartmentTransaction => {
  const cells = row.find('td');

  const firstCellData = parseFirstCell(cells.eq(0).text());
  const secondCellData = parseSecondCell(cells.eq(1).text());
  const thirdCellData = parseThirdCell(cells.eq(2).text());

  // 모든 거래 정보를 조합하여 고유한 ID 생성
  const transactionId = createTransactionId({
    regionCode: area,
    address: firstCellData.address,
    apartName: firstCellData.apartName,
    tradeDate: secondCellData.tradeDate,
    size: secondCellData.size,
    floor: secondCellData.floor,
    tradeAmount: thirdCellData.tradeAmount,
  });

  return {
    transactionId,
    ...firstCellData,
    ...secondCellData,
    ...thirdCellData,
  };
};

// HTML 파싱 최적화
const parseHtmlData = (html: string, area: string): ApartmentTransaction[] => {
  const $ = cheerio.load(html, {
    decodeEntities: true,
  });

  const transactions: ApartmentTransaction[] = [];

  // 테이블 직접 선택으로 성능 향상
  $('table').each((_, table) => {
    const $table = $(table);
    const hasTradeData = $table.find('td:contains("단지명")').length > 0;

    if (!hasTradeData) return;

    $table
      .find('tr')
      .slice(1)
      .each((_, row) => {
        try {
          const transaction = parseRowData($(row), area);
          if (transaction.apartName) {
            transactions.push(transaction);
          }
        } catch (error) {
          console.warn('테이블 파싱 오류:', error);
        }
      });
  });

  return transactions;
};

// 재시도 로직이 포함된 fetch 함수
const fetchWithRetry = async (
  url: string,
  retries = MAX_RETRIES
): Promise<string> => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // 각 시도마다 랜덤 대기 (봇 탐지 우회)
      if (attempt > 1) {
        const delay = 2000 + Math.random() * 3000; // 2-5초 랜덤 대기
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

      // 매번 다른 User-Agent 사용
      const userAgents = [
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      ];

      const randomUA =
        userAgents[Math.floor(Math.random() * userAgents.length)];

      const response = await fetch(url, {
        headers: {
          'User-Agent': randomUA,
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
          'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
          'Accept-Encoding': 'gzip, deflate, br',
          DNT: '1',
          Connection: 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'same-origin',
          'Sec-Fetch-User': '?1',
          Referer: 'https://apt2.me/',
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
          // 중요: X-Forwarded-For 헤더로 IP 위장
          'X-Forwarded-For': `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // 요청 간격 추가 (429 에러 방지)
      await new Promise(resolve =>
        setTimeout(resolve, 500 + Math.random() * 1000)
      );

      return await response.text();
    } catch (error) {
      console.warn(`요청 시도 ${attempt} 실패:`, error);

      if (attempt === retries) {
        throw error;
      }

      // 지수 백오프 대기
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw new Error('Max retries exceeded');
};

// 페이지 데이터 가져오기 (Daily 버전)
const fetchPageData = async (
  area: string,
  page: number
): Promise<ParsedPageResult> => {
  try {
    // 신규 거래는 Daily 엔드포인트 사용
    const url = `https://apt2.me/apt/AptDaily.jsp?area=${area}&pages=${page}`;
    const html = await fetchWithRetry(url);
    const data = parseHtmlData(html, area);

    return {
      page,
      data,
      hasData: data.length > 0,
    };
  } catch (error) {
    console.error(`페이지 ${page} 조회 실패:`, error);
    return {
      page,
      data: [],
      hasData: false,
    };
  }
};

// 조기 종료 최적화
const checkIfMorePagesExist = (results: ParsedPageResult[]): boolean => {
  const lastBatch = results.slice(-BATCH_SIZE);
  return lastBatch.some(result => result.hasData);
};

// 크롤링 메인 함수
export async function crawlNewTransactions(area: string): Promise<CrawlResult> {
  const startTime = Date.now();

  const allResults: ParsedPageResult[] = [];
  let currentPage = 1;
  let hasMoreData = true;

  while (hasMoreData) {
    // 배치 단위로 병렬 처리
    const batchPages = Array.from(
      { length: BATCH_SIZE },
      (_, i) => currentPage + i
    );

    const batchPromises = batchPages.map(page =>
      limit(() => fetchPageData(area, page))
    );

    const batchResults = await Promise.all(batchPromises);
    allResults.push(...batchResults);

    // 조기 종료 조건 확인
    hasMoreData = checkIfMorePagesExist(batchResults);
    currentPage += BATCH_SIZE;

    // 무한 루프 방지 (최대 100페이지)
    if (currentPage > 100) {
      break;
    }
  }

  // 결과 집계
  const validResults = allResults.filter(result => result.hasData);
  const allTransactions = validResults.flatMap(result => result.data);
  const totalPages = validResults.length;
  const processingTime = Date.now() - startTime;

  return {
    count: allTransactions.length,
    list: allTransactions,
    totalPages,
    processingTime,
  };
}
