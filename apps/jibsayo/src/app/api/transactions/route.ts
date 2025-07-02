import cheerio from 'cheerio';
import pLimit from 'p-limit';

import { obfuscateKorean } from '../utils';

// 성능 최적화를 위한 상수 정의
const CONCURRENT_REQUESTS = 5; // 동시 요청 수 증가
const BATCH_SIZE = 5; // 배치 크기 증가
const REQUEST_TIMEOUT = 10000; // 타임아웃 10초
const MAX_RETRIES = 3; // 최대 재시도 횟수

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
  // 한국어 금액 파싱을 위한 정규표현식 개선
  amount: /(\d+)억?\s*(\d+)?천?\s*(\d+)?만?/,
  date: /(\d{2})\.(\d{2})\.(\d{2})/,
  dong: /\S+동/,
} as const;

// 타입 정의
interface ApartmentTransaction {
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

interface ParsedPageResult {
  page: number;
  data: ApartmentTransaction[];
  hasData: boolean;
}

interface CrawlResult {
  count: number;
  list: ApartmentTransaction[];
  totalPages: number;
  processingTime: number;
}

// 메모리 효율적인 문자열 처리
const optimizedSplitCellText = (text: string): string[] => {
  return text.replace(REGEXES.whitespace, '').split('\n').filter(Boolean);
};

// 숫자 추출 최적화
const extractNumber = (str: string | undefined): number => {
  if (!str) return 0;
  const match = str.match(/\d+/);
  return match ? parseInt(match[0], 10) : 0;
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

  const apartId = `${obfuscateKorean(area)}__${obfuscateKorean(firstCellData.address)}__${obfuscateKorean(firstCellData.apartName)}`;

  return {
    apartId,
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
          console.warn('Row parsing error:', error);
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
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

      const response = await fetch(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
          'Cache-Control': 'no-cache',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.text();
    } catch (error) {
      console.warn(`Attempt ${attempt} failed:`, error);

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

// 페이지 데이터 가져오기
const fetchPageData = async (
  area: string,
  createDt: string,
  page: number
): Promise<ParsedPageResult> => {
  try {
    const url = `https://apt2.me/apt/AptMonth.jsp?area=${area}&createDt=${createDt}&pages=${page}`;
    const html = await fetchWithRetry(url);
    const data = parseHtmlData(html, area);

    return {
      page,
      data,
      hasData: data.length > 0,
    };
  } catch (error) {
    console.error(`Error fetching page ${page}:`, error);
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

export async function GET(request: Request): Promise<Response> {
  const startTime = Date.now();

  try {
    const { searchParams } = new URL(request.url);
    const area = searchParams.get('area');
    const createDt = searchParams.get('createDt');

    if (!area || !createDt) {
      return Response.json(
        { message: '필수 파라미터가 누락되었습니다.' },
        { status: 400 }
      );
    }

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
        limit(() => fetchPageData(area, createDt, page))
      );

      const batchResults = await Promise.all(batchPromises);
      allResults.push(...batchResults);

      // 조기 종료 조건 확인
      hasMoreData = checkIfMorePagesExist(batchResults);
      currentPage += BATCH_SIZE;

      // 무한 루프 방지 (최대 100페이지)
      if (currentPage > 100) {
        console.warn('Maximum page limit reached');
        break;
      }
    }

    // 결과 집계
    const validResults = allResults.filter(result => result.hasData);
    const allTransactions = validResults.flatMap(result => result.data);
    const totalPages = validResults.length;
    const processingTime = Date.now() - startTime;

    console.log(
      `크롤링 완료: ${allTransactions.length}건, ${totalPages}페이지, ${processingTime}ms`
    );

    const result: CrawlResult = {
      count: allTransactions.length,
      list: allTransactions,
      totalPages,
      processingTime,
    };

    return Response.json(result);
  } catch (error) {
    console.error('크롤링 오류:', error);
    return Response.json(
      {
        message: '서버 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류',
      },
      { status: 500 }
    );
  }
}
