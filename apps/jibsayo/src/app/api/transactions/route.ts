import { XMLParser } from 'fast-xml-parser';

import { convertGovApiItemToTransaction } from './services';
import {
  GovApiItem,
  GovApiResponse,
  TransactionItem,
  TransactionsResponse,
} from './types';

// 동적 라우트로 설정 (정적 빌드 시 request.url 사용으로 인한 오류 방지)
export const dynamic = 'force-dynamic';

// XML 파서 설정
const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '',
  parseAttributeValue: true,
});

// 국토부 API 호출
const fetchGovApiData = async (
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

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const xmlText = await response.text();

  // 디버깅: XML 원문 로깅
  console.log('XML 원문 (처음 500자):', xmlText.substring(0, 500));

  const parsedData: GovApiResponse = xmlParser.parse(xmlText);

  // 디버깅: 파싱된 헤더 정보 로깅
  console.log('파싱된 헤더:', {
    resultCode: parsedData.response?.header?.resultCode,
    resultMsg: parsedData.response?.header?.resultMsg,
  });

  // 응답 구조 확인
  if (!parsedData.response) {
    console.error('응답 구조가 올바르지 않습니다:', parsedData);
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
    console.log('데이터가 없습니다 (정상 응답)');
    return [];
  }

  const itemArray = Array.isArray(items) ? items : [items];
  console.log(`조회된 아이템 수: ${itemArray.length}`);
  return itemArray;
};

export async function GET(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const area = searchParams.get('area'); // 지역 코드 (예: 11740)
    const createDt = searchParams.get('createDt'); // 거래년월 (예: 202510)

    if (!area || !createDt) {
      return Response.json(
        { message: '필수 파라미터가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // createDt 형식 변환 (YYYYMM -> YYYYMM 형식 유지)
    // 예: "2025-10" -> "202510", "202510" -> "202510"
    const dealYmd = createDt.replace(/-/g, '');

    // 국토부 API 호출
    const govApiItems = await fetchGovApiData(area, dealYmd);

    // 내부 형식으로 변환
    const transactions: TransactionItem[] = govApiItems.map(item =>
      convertGovApiItemToTransaction(item, area)
    );

    const result: TransactionsResponse = {
      count: transactions.length,
      list: transactions,
    };

    return Response.json(result);
  } catch (error) {
    console.error('국토부 API 조회 오류:', error);
    return Response.json(
      {
        message: '서버 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류',
      },
      { status: 500 }
    );
  }
}
