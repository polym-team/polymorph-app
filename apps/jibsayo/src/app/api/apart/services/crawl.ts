import { logger } from '@/app/api/shared/utils/logger';

import cheerio, { CheerioAPI, Element } from 'cheerio';

export interface CrawlResponse {
  regionCode: string;
  apartName: string;
  address: string;
  housholdsCount: string;
  parking: string;
  floorAreaRatio: number;
  buildingCoverageRatio: number;
  tradeItems: {
    tradeDate: string;
    size: number;
    floor: number;
    tradeAmount: number;
  }[];
}

const formatToAmount = (amountText: string): number => {
  let amount: number = 0;
  let restText: string = amountText;

  if (amountText.includes('억')) {
    amount += Number(amountText.split('억')[0]) * 100_000_000;
    restText = amountText.split('억')[1];
  }

  if (amountText.includes('천')) {
    amount += Number(restText.split('천')[0]) * 10_000_000;
    restText = restText.split('천')[1];
  }

  if (restText) {
    amount += Number(restText) * 10_000;
  }

  return amount;
};

// 주소를 목록과 같은 형태로 정규화하는 함수
const normalizeAddress = (address: string): string => {
  if (!address) return '';

  // 괄호 안의 내용 제거 (예: "89(양재대로 1218)" → "")
  const withoutParentheses = address.replace(/\([^)]*\)/g, '').trim();

  // 숫자와 괄호 제거 (예: "89" → "")
  const withoutNumbers = withoutParentheses.replace(/\d+/g, '').trim();

  // 연속된 공백을 하나로 변환
  const normalized = withoutNumbers.replace(/\s+/g, ' ').trim();

  return normalized;
};

const calculateApartInfo = ($: CheerioAPI) => {
  const getTradeInfoTable = () => {
    let tradeInfoTable: Element | null = null;

    $('table').each((_, table) => {
      const tableText = $(table).text();

      if (!tradeInfoTable && tableText.includes('주소복사')) {
        tradeInfoTable = table;
      }
    });

    return tradeInfoTable;
  };

  const getApartInfo = (
    tradeInfoTable: Element | null
  ): Omit<CrawlResponse, 'tradeItems' | 'regionCode' | 'apartName'> => {
    if (!tradeInfoTable) {
      return {
        address: '',
        housholdsCount: '',
        parking: '',
        floorAreaRatio: 0,
        buildingCoverageRatio: 0,
      };
    }

    // td 구조에 의존하지 않고 전체 텍스트에서 패턴 기반으로 추출
    const fullText = $(tradeInfoTable).text();

    // 1. 주소 추출: "서울특별시", "경기도" 등으로 시작하는 주소
    let rawAddress = '';
    const addressMatch = fullText.match(
      /(서울특별시|경기도|인천광역시|부산광역시|대구광역시|광주광역시|대전광역시|울산광역시|세종특별자치시|제주특별자치도|강원도|충청북도|충청남도|전라북도|전라남도|경상북도|경상남도)\s+[^\n]+/
    );
    if (addressMatch) {
      rawAddress = addressMatch[0].split('세대수')[0].trim();
    }
    const address = normalizeAddress(rawAddress);

    // 2. 세대수 추출: "세대수(동수) : 400세대(10동)" 형태
    let housholdsCount = '';
    const housholdsMatch = fullText.match(/세대수\(동수\)\s*[:：]\s*([^\n]+)/);
    if (housholdsMatch) {
      housholdsCount = housholdsMatch[1].trim();
    }

    // 3. 주차 정보 추출: "주차 : 840대(세대당 2.1대)" 형태
    let parking = '';
    const parkingMatch = fullText.match(/주차\s*[:：]\s*([^\n]+)/);
    if (parkingMatch) {
      parking = parkingMatch[1].trim();
    }

    // 4. 용적률 추출: "용적률 : 199.0%" 형태
    let floorAreaRatio = 0;
    const floorAreaMatch = fullText.match(/용적률\s*[:：]\s*(\d+\.?\d*)%/);
    if (floorAreaMatch) {
      floorAreaRatio = Number(floorAreaMatch[1]);
    }

    // 5. 건폐율 추출: "건폐율:24.0%" 또는 "건폐율 : 24.0%" 형태
    let buildingCoverageRatio = 0;
    const buildingCoverageMatch = fullText.match(
      /건폐율\s*[:：]\s*(\d+\.?\d*)%/
    );
    if (buildingCoverageMatch) {
      buildingCoverageRatio = Number(buildingCoverageMatch[1]);
    }

    logger.info('파싱된 아파트 정보', {
      rawAddress,
      address,
      housholdsCount,
      parking,
      floorAreaRatio,
      buildingCoverageRatio,
    });

    return {
      address,
      housholdsCount,
      parking,
      floorAreaRatio,
      buildingCoverageRatio,
    };
  };

  return getApartInfo(getTradeInfoTable());
};

const calculateTradeItems = ($: CheerioAPI): CrawlResponse['tradeItems'] => {
  const getTrs = () => {
    const trs: Element[] = [];

    $('table').each((_, table) => {
      const tableText = $(table).text();

      if (tableText.includes('계약일')) {
        $(table)
          .find('tr:not(:first-child)')
          .each((_, tr) => {
            trs.push(tr);
          });
      }
    });

    return trs;
  };

  const getTradeItems = (trs: Element[]) => {
    const tradeItems: CrawlResponse['tradeItems'] = [];

    $(trs).each((_, tr) => {
      // td 구조에 상관없이 전체 텍스트를 가져와서 패턴 기반으로 파싱
      const rowText = $(tr).text().trim();

      // 빈 행이거나 의미없는 행은 스킵
      if (!rowText || rowText.length < 10) {
        return;
      }

      // 1. 계약일 파싱: "2025.09.24" 형태의 날짜
      const tradeDateMatch = rowText.match(/(\d{4})\.(\d{2})\.(\d{2})/);
      const tradeDate = tradeDateMatch
        ? `${tradeDateMatch[1]}-${tradeDateMatch[2]}-${tradeDateMatch[3]}`
        : '';

      // 2. 금액 파싱: "36억", "31억7천", "1억2천500" 등
      //    "(고)" 표시가 있을 수 있음
      const amountMatch = rowText.match(/(\d+억[^\s]*?)(?:\s|$|\(고\))/);
      const amountText = amountMatch ? amountMatch[1] : '';
      const tradeAmount = formatToAmount(amountText);

      // 3. 면적 파싱: 다양한 형태의 면적 정보 처리
      //    - "146.7139" (제곱미터)
      //    - "25.10.15" (제곱미터, 소수점 2자리) - 이는 면적이 아닐 수 있음
      //    - "46평", "54A평" (평 단위)
      let size = 0;

      // 먼저 제곱미터 형태의 숫자들을 찾기 (소수점 2자리 이상)
      const sizeMatches = rowText.match(/(\d+\.\d{2,})/g);
      if (sizeMatches && sizeMatches.length > 0) {
        // 면적으로 보이는 숫자들을 필터링
        // 일반적으로 아파트 면적은 20㎡ 이상이므로 작은 숫자들은 제외
        // 또한 "25.10.15"와 같은 형태는 면적이 아닐 가능성이 높음
        const validSizes = sizeMatches
          .map(match => Number(match))
          .filter(s => {
            // 면적으로 보이는 조건들
            return (
              s >= 20 && // 20㎡ 이상
              s <= 500 && // 500㎡ 이하 (너무 큰 면적 제외)
              !Number.isInteger(s) && // 정수가 아닌 소수점 포함
              s.toString().split('.')[1].length >= 2
            ); // 소수점 2자리 이상
          });

        if (validSizes.length > 0) {
          // 가장 큰 숫자를 면적으로 간주 (일반적으로 면적이 가장 큰 숫자)
          size = Math.max(...validSizes);
        }
      }

      // 제곱미터 형태를 찾지 못한 경우 평 단위 형태 찾기
      if (size === 0) {
        const pyeongMatch = rowText.match(/(\d+)[A-Z]?평/);
        if (pyeongMatch) {
          const pyeongValue = Number(pyeongMatch[1]);
          // 평 단위도 합리적인 범위인지 확인 (5평 이상, 200평 이하)
          if (pyeongValue >= 5 && pyeongValue <= 200) {
            size = pyeongValue * 3.3058; // 평을 제곱미터로 변환
          }
        }
      }

      // 4. 층수 파싱: "6층", "12층" 등
      const floorMatch = rowText.match(/(\d+)층/);
      const floor = floorMatch ? Number(floorMatch[1]) : 0;

      // 필수 항목이 있으면 추가
      if (tradeDate && size && tradeAmount) {
        tradeItems.push({ tradeDate, size, floor, tradeAmount });
      }
    });

    return tradeItems;
  };

  return getTradeItems(getTrs());
};

const fetchTradeDetail = async (
  apartName: string,
  area: string,
  retries = 3
): Promise<string> => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // 먼저 메인 페이지에 접근해서 세션 확보
      const mainResponse = await fetch('https://apt2.me/', {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      });

      const cookies = mainResponse.headers.get('set-cookie') || '';

      // 랜덤 지연 추가 (봇 탐지 우회)
      if (attempt > 1) {
        const delay = 2000 + Math.random() * 3000; // 2-5초 랜덤 대기
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      const url = `https://apt2.me/apt/AptReal.jsp?danji_nm=${encodeURIComponent(apartName)}&area=${area}`;

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
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
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
          Cookie: cookies,
          // IP 위장 헤더 추가
          'X-Forwarded-For': `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // 요청 간격 추가 (429 에러 방지)
      await new Promise(resolve =>
        setTimeout(resolve, 500 + Math.random() * 1000)
      );

      const html = await response.text();

      return html;
    } catch (error) {
      logger.error('크롤링 에러', { error: JSON.stringify(error, null, 2) });

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

export const createResponse = async (
  apartName: string,
  area: string
): Promise<CrawlResponse> => {
  logger.info(`크롤링 시작(${apartName})`);

  const html = await fetchTradeDetail(apartName, area);
  const $ = cheerio.load(html);
  const apartInfo = calculateApartInfo($);
  const tradeItems = calculateTradeItems($);

  const result = {
    ...apartInfo,
    regionCode: area,
    apartName,
    tradeItems,
  };

  logger.info('크롤링 완료', { result: JSON.stringify(result, null, 2) });

  return result;
};
