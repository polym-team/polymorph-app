import {
  createTransactionId,
  parseApartToken,
} from '@/app/api/shared/services/transaction/service';
import { logger } from '@/app/api/shared/utils/logger';

import cheerio, { CheerioAPI, Element } from 'cheerio';

import type { TransactionsByTokenResponse } from '../types';

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

const calculateTransactionItems = (
  $: CheerioAPI,
  apartToken: string
): TransactionsByTokenResponse['items'] => {
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

  const getTransactionItems = (trs: Element[]) => {
    const transactionItems: TransactionsByTokenResponse['items'] = [];

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

      const transactionId = createTransactionId({
        apartToken,
        tradeDate,
        tradeAmount,
        size,
        floor,
      });

      // 필수 항목이 있으면 추가
      if (tradeDate && size && tradeAmount) {
        transactionItems.push({
          transactionId,
          tradeDate,
          size,
          floor,
          tradeAmount,
        });
      }
    });

    return transactionItems;
  };

  return getTransactionItems(getTrs());
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
        cache: 'no-store',
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
        cache: 'no-store',
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
  apartToken: string
): Promise<TransactionsByTokenResponse> => {
  const parsedApartToken = parseApartToken(apartToken);
  if (!parsedApartToken) {
    throw new Error('아파트 토큰 파싱 실패');
  }

  const { regionCode, apartName } = parsedApartToken;
  logger.info(`크롤링 시작(${apartName})`);

  const html = await fetchTradeDetail(apartName, regionCode);
  const $ = cheerio.load(html);
  const items = calculateTransactionItems($, apartToken);

  logger.info('크롤링 완료', { result: JSON.stringify(items, null, 2) });

  return { items };
};
