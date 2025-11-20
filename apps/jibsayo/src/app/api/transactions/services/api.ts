import { XMLParser } from 'fast-xml-parser';

import { logger } from '../../shared/utils/logger';
import { GovApiItem, GovApiResponse } from '../models/types';

// XML 파서 설정
const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '',
  parseAttributeValue: true,
});

// 국토부 API 호출
export const fetchGovApiData = async (
  lawdCd: string,
  dealYmd: string,
  pageNo: number = 1,
  numOfRows: number = 9999
): Promise<GovApiItem[]> => {
  const apiKey = process.env.NEXT_PUBLIC_GO_DATA_API_KEY;

  if (!apiKey) {
    throw new Error(
      'NEXT_PUBLIC_GO_DATA_API_KEY 환경변수가 설정되지 않았습니다.'
    );
  }

  const url = new URL(
    'https://apis.data.go.kr/1613000/RTMSDataSvcAptTrade/getRTMSDataSvcAptTrade'
  );
  url.searchParams.set('LAWD_CD', lawdCd);
  url.searchParams.set('DEAL_YMD', dealYmd);
  url.searchParams.set('serviceKey', apiKey);
  url.searchParams.set('pageNo', pageNo.toString());
  url.searchParams.set('numOfRows', numOfRows.toString());

  const response = await fetch(url.toString(), {
    headers: {
      'User-Agent': 'Node.js/jibsayo-real-estate-api',
      'Accept': 'text/xml,application/xml',
      'Accept-Language': 'ko-KR,ko;q=0.9',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const xmlText = await response.text();

  const parsedData: GovApiResponse = xmlParser.parse(xmlText);

  // 응답 구조 확인
  if (!parsedData.response) {
    logger.error('응답 구조가 올바르지 않습니다', { response: parsedData });
    throw new Error('API 응답 형식이 올바르지 않습니다.');
  }

  // 에러 체크 - resultCode는 숫자 0 또는 문자열 "000"이면 성공
  // XML 파서가 숫자로 변환할 수 있으므로 타입을 확인하여 처리
  const resultCodeRaw = parsedData.response.header?.resultCode as
    | string
    | number
    | undefined;
  const resultCodeStr = String(resultCodeRaw ?? '').trim();
  const resultCode =
    (typeof resultCodeRaw === 'number' && resultCodeRaw === 0) ||
    resultCodeStr === '000' ||
    resultCodeStr === '0'
      ? '000'
      : resultCodeStr;
  const resultMsg = parsedData.response.header?.resultMsg;

  // resultCode가 있고 '000'이 아닌 경우만 에러
  if (resultCode && resultCode !== '000') {
    throw new Error(
      `API 오류 (코드: ${resultCode}): ${resultMsg || '알 수 없는 오류'}`
    );
  }

  // 데이터가 없는 경우 (정상 응답이지만 데이터 없음)
  const items = parsedData.response?.body?.items?.item;
  if (!items) {
    return [];
  }

  const itemArray = Array.isArray(items) ? items : [items];
  logger.info('조회된 아이템 수', { count: itemArray.length });
  return itemArray;
};

// new-transactions API 호출하여 신규 거래 목록 반환
export const fetchNewTransactions = async (
  area: string,
  origin: string
): Promise<
  Array<{
    address: string;
    apartName: string;
    tradeDate: string;
    floor: number | null;
    tradeAmount: number;
    size: number | null;
  }>
> => {
  try {
    const newTransactionsUrl = new URL('/api/new-transactions', origin);
    newTransactionsUrl.searchParams.set('area', area);

    const response = await fetch(newTransactionsUrl.toString());
    if (!response.ok) {
      logger.warn('new-transactions API 호출 실패', {
        status: response.status,
        statusText: response.statusText,
      });
      return [];
    }

    const data = await response.json();
    const transactions = data.list || [];

    // 비교에 필요한 필드만 추출
    return transactions.map(
      (item: {
        address: string;
        apartName: string;
        tradeDate: string;
        floor: number | null;
        tradeAmount: number;
        size: number | null;
      }) => ({
        address: item.address || '',
        apartName: item.apartName || '',
        tradeDate: item.tradeDate || '',
        floor: item.floor,
        tradeAmount: item.tradeAmount || 0,
        size: item.size,
      })
    );
  } catch (error) {
    logger.warn('new-transactions API 호출 중 오류 발생', { error });
    return [];
  }
};
