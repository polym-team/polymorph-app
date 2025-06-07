import cheerio, { Cheerio } from 'cheerio';
import pLimit from 'p-limit';

import { obfuscateKorean } from '../utils';

// 동시 요청 수 제한 (서버 부하 방지)
const limit = pLimit(3);

const calculateIsTradeListTable = (table: Cheerio<any>): boolean =>
  !!table.find(`td:contains("단지명")`).text();

const splitCellText = (text: string): string[] =>
  text.replace(/^\s+|\s+$/gm, '').split('\n');

const formatToNumber = (str: string | undefined): number =>
  str ? Number(str.replace(/[^0-9]/g, '')) : 0;

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

const parseFirstCellData = (
  cell: Cheerio<any>
): {
  apartName: string;
  buildedYear: number | null;
  householdsNumber: number | null;
  address: string;
} => {
  const texts = splitCellText(cell.text());

  const buildedYearText = texts.find(text => text.includes('년'));
  const householdsNumberText = texts.find(text => text.includes('세대'));
  const addressText = texts.find((text, i) => i > 0 && text.includes('동'));

  return {
    apartName: texts[0],
    buildedYear: buildedYearText
      ? formatToNumber(buildedYearText.split(' ')[0])
      : null,
    householdsNumber: householdsNumberText
      ? formatToNumber(householdsNumberText.split(' / ')[0])
      : null,
    address: addressText ?? '',
  };
};

const parseSecondCellData = (
  cell: Cheerio<any>
): {
  tradeDate: string;
  size: number | null;
  floor: number | null;
} => {
  const texts = splitCellText(cell.text());

  const sizeText = texts.find(text => text.includes('㎡'));
  const floorText = texts.find(text => text.includes('층'));

  return {
    tradeDate: '20' + texts[0].split(' ')[0].replace(/\./g, '-'),
    size: sizeText ? Number(sizeText.split('㎡')[0]) : null,
    floor: floorText ? formatToNumber(floorText.replace(/층/g, '')) : null,
  };
};

const parseThirdCellData = (
  cell: Cheerio<any>
): {
  isNewRecord: boolean;
  tradeAmount: number;
  maxTradeAmount: number;
} => {
  const texts = splitCellText(cell.text());

  const isNewRecord = texts.some(text => text.includes('(신)'));
  const tradeAmountText = texts[0];
  const maxTradeAmountText = texts.length === 4 ? texts[2] : texts[1];

  return {
    isNewRecord,
    tradeAmount: formatToAmount(tradeAmountText.split(' (신)')[0]),
    maxTradeAmount: formatToAmount(maxTradeAmountText.split(' ')[0]),
  };
};

const parseRowData = (
  row: Cheerio<any>,
  area: string
): Record<string, unknown> => {
  const firstCellItems = parseFirstCellData(row.find('td:nth-child(1)'));
  const secondCellitems = parseSecondCellData(row.find('td:nth-child(2)'));
  const thirdCellitems = parseThirdCellData(row.find('td:nth-child(3)'));

  const apartId = `${obfuscateKorean(area)}__${obfuscateKorean(firstCellItems.address)}__${obfuscateKorean(firstCellItems.apartName)}`;

  return {
    apartId,
    ...firstCellItems,
    ...secondCellitems,
    ...thirdCellitems,
  };
};

const parseTradeListData = (
  html: string,
  area: string
): Record<string, unknown>[] => {
  const $ = cheerio.load(html);
  const tables = $('table');

  const list: Record<string, unknown>[] = [];

  tables.each((_, table) => {
    const isTradeListTable = calculateIsTradeListTable($(table));

    if (!isTradeListTable) {
      return;
    }

    $(table)
      .find('tr:not(:first-child)')
      .each((_, row) => {
        list.push(parseRowData($(row), area));
      });
  });

  return list;
};

const fetchTradeList = async ({
  area,
  createDt,
  page,
}: {
  area: string;
  createDt: string;
  page: number;
}): Promise<string> => {
  const response = await fetch(
    `https://apt2.me/apt/AptMonth.jsp?area=${area}&createDt=${createDt}&pages=${page}`,
    {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.text();
};

// 첫 페이지에서 총 페이지 수를 확인하는 함수
const getTotalPages = async (
  area: string,
  createDt: string
): Promise<number> => {
  const html = await fetchTradeList({ area, createDt, page: 1 });
  const $ = cheerio.load(html);
  const paginationText = $('a:contains("맨위로")').prev().text();
  const match = paginationText.match(/(\d+)\s*\/\s*(\d+)/);

  if (match) {
    return parseInt(match[2], 10);
  }

  // 페이지네이션 정보가 없는 경우, 데이터가 있는지 확인
  const list = parseTradeListData(html, area);
  return list.length > 0 ? 1 : 0;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const area = searchParams.get('area');
  const createDt = searchParams.get('createDt');

  if (!area || !createDt) {
    return Response.json(
      { message: '필수 파라미터가 누락되었습니다.' },
      { status: 400 }
    );
  }

  try {
    // 총 페이지 수 확인
    const totalPages = await getTotalPages(area, createDt);

    if (totalPages === 0) {
      return Response.json({ count: 0, list: [] });
    }

    // 병렬로 모든 페이지 크롤링
    const pagePromises = Array.from(
      { length: totalPages },
      (_, i) => i + 1
    ).map(page =>
      limit(async () => {
        try {
          const html = await fetchTradeList({ area, createDt, page });
          return parseTradeListData(html, area);
        } catch (error) {
          console.error(`Error fetching page ${page}:`, error);
          return [];
        }
      })
    );

    // 모든 페이지의 결과를 기다림
    const results = await Promise.all(pagePromises);

    // 결과 합치기
    const list = results.flat();
    const count = list.length;

    return Response.json({ count, list });
  } catch (error) {
    console.error('Crawling error:', error);
    return Response.json(
      { message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
