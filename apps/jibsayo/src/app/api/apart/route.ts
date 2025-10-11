import cheerio, { CheerioAPI, Element } from 'cheerio';

import { formatToAmount } from '../utils';

// 동적 라우트로 설정 (정적 빌드 시 request.url 사용으로 인한 오류 방지)
export const dynamic = 'force-dynamic';

interface Response {
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
      if (!tradeInfoTable && $(table).text().includes('주소복사')) {
        tradeInfoTable = table;
      }
    });

    return tradeInfoTable;
  };

  const getApartInfo = (
    tradeInfoTable: Element | null
  ): Omit<Response, 'tradeItems'> => {
    if (!tradeInfoTable) {
      return {
        address: '',
        housholdsCount: '',
        parking: '',
        floorAreaRatio: 0,
        buildingCoverageRatio: 0,
      };
    }

    const texts = $(tradeInfoTable)
      .find('td')
      .text()
      .replace(/^\s+|\s+$/gm, '')
      .replace(/<br \/>/g, '')
      .split('\n');

    const rawAddress = texts[1] || '';
    const address = normalizeAddress(rawAddress);
    const housholdsCount = (texts[2] || '').replace('세대수(동수) : ', '');
    const parking = (texts[3] || '').replace('주차 : ', '');

    const rateTexts = (texts[4] || '').split('%');
    const floorAreaRatio =
      Number((rateTexts[0] || '').replace('용적률 : ', '')) || 0;
    const buildingCoverageRatio =
      Number((rateTexts[1] || '').replace('건폐율:', '')) || 0;

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

const calculateTradeItems = ($: CheerioAPI): Response['tradeItems'] => {
  const getTrs = () => {
    const trs: Element[] = [];

    $('table').each((_, table) => {
      if ($(table).text().includes('계약일')) {
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
    const tradeItems: Response['tradeItems'] = [];

    $(trs).each((_, tr) => {
      const tds = $(tr).find('td');

      if (tds.length < 3) return; // td가 충분하지 않으면 skip

      const firstTdText = $(tds[0])
        .text()
        .replace(/^\s+|\s+$/gm, '')
        .split('\n');
      const secondTdText = $(tds[1])
        .text()
        .replace(/^\s+|\s+$/gm, '')
        .split('\n');
      const thirdTdText = $(tds[2])
        .text()
        .replace(/^\s+|\s+$/gm, '')
        .split('\n');

      const tradeDate = (firstTdText[0] || '').replace(/\./g, '-');
      const size = Number((secondTdText[0] || '').split(' ')[0]) || 0;
      const floor = Number((secondTdText[1] || '').split('층')[0]) || 0;
      const tradeAmount = formatToAmount(
        (thirdTdText[0] || '').replace('(고)', '')
      );

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
      console.warn(`Attempt ${attempt} failed:`, error);

      if (attempt === retries) {
        console.error('크롤링 에러:', error);
        throw error;
      }

      // 지수 백오프 대기
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw new Error('Max retries exceeded');
};

const createResponse = async (
  apartName: string,
  area: string
): Promise<Response> => {
  const html = await fetchTradeDetail(apartName, area);
  const $ = cheerio.load(html);

  const apartInfo = calculateApartInfo($);
  const tradeItems = calculateTradeItems($);

  return {
    ...apartInfo,
    tradeItems,
  };
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const apartName = searchParams.get('apartName');
  const area = searchParams.get('area');

  if (!apartName || !area) {
    return Response.json(
      { message: '필수 파라미터(apartName, area)가 누락되었습니다.' },
      { status: 400 }
    );
  }

  try {
    return Response.json(await createResponse(apartName, area));
  } catch {
    return Response.json(
      { message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
