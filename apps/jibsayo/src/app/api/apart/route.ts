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

    const address = texts[1] || '';
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
  area: string
): Promise<string> => {
  try {
    // 먼저 메인 페이지에 접근해서 세션 확보
    const mainResponse = await fetch('https://apt2.me/', {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    const cookies = mainResponse.headers.get('set-cookie') || '';

    const url = `https://apt2.me/apt/AptReal.jsp?danji_nm=${encodeURIComponent(apartName)}&area=${area}`;

    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        Connection: 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'same-origin',
        Referer: 'https://apt2.me/',
        'Cache-Control': 'max-age=0',
        Cookie: cookies,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();

    return html;
  } catch (error) {
    console.error('크롤링 에러:', error);
    throw error;
  }
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
  } catch (error) {
    return Response.json(
      { message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
