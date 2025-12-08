import {
  createApartToken,
  createTransactionId,
  normalizeAddress,
} from '@/app/api/shared/services/transaction/service';

import { GovApiItem, TransactionItem } from '../types';

// 거래일자 조합 (YYYY-MM-DD) - XML 파서가 숫자로 변환할 수 있으므로 문자열로 변환
const calculateTradeDate = (item: GovApiItem): string => {
  const year = String(item.dealYear || '').trim();
  const month = String(item.dealMonth || '')
    .trim()
    .padStart(2, '0');
  const day = String(item.dealDay || '')
    .trim()
    .padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// 거래가격 계산 (만원 단위 -> 원 단위로 변환) - XML 파서가 숫자로 변환할 수 있으므로 문자열로 변환
const calculateTradeAmount = (item: GovApiItem): number => {
  const dealAmountText = String(item.dealAmount || '')
    .replace(/,/g, '')
    .trim();
  return dealAmountText ? parseInt(dealAmountText, 10) * 10000 : 0;
};

// 전용면적 계산 (제곱미터) - XML 파서가 숫자로 변환할 수 있으므로 문자열로 변환
const calculateSize = (item: GovApiItem): number => {
  const excluUseArText = String(item.excluUseAr || '').trim();
  return excluUseArText ? parseFloat(excluUseArText) : 0;
};

// 층 계산 - XML 파서가 숫자로 변환할 수 있으므로 문자열로 변환
const calculateFloor = (item: GovApiItem): number | null => {
  const floorText = String(item.floor || '').trim();
  return floorText ? parseInt(floorText, 10) : null;
};

// 건축년도 계산 - XML 파서가 숫자로 변환할 수 있으므로 문자열로 변환
const calculateBuildedYear = (item: GovApiItem): number | null => {
  const buildYearText = String(item.buildYear || '').trim();
  return buildYearText ? parseInt(buildYearText, 10) : null;
};

// 주소 조합 - umdNm만 사용
const calculateAddress = (item: GovApiItem): string => {
  const umdNm = String(item.umdNm || '').trim();
  return normalizeAddress(umdNm);
};

const convertGovApiItemToTransaction = (
  item: GovApiItem,
  area: string
): TransactionItem => {
  const tradeDate = calculateTradeDate(item);
  const tradeAmount = calculateTradeAmount(item);
  const size = calculateSize(item);
  const floor = calculateFloor(item);
  const buildedYear = calculateBuildedYear(item);
  const address = calculateAddress(item);
  const apartName = String(item.aptNm || '').trim();

  const apartToken = createApartToken({
    regionCode: area,
    apartName,
    jibun: item.jibun ?? '',
  });

  const transactionId = floor
    ? createTransactionId({
        apartToken,
        size,
        floor,
        tradeDate,
        tradeAmount,
      })
    : '';

  return {
    transactionId,
    apartToken,
    apartName,
    buildedYear,
    address,
    tradeDate,
    size,
    floor,
    tradeAmount,
  };
};

export const convertGovApiItemToTransactions = (
  items: GovApiItem[],
  area: string
) => {
  return items.map(item => convertGovApiItemToTransaction(item, area));
};
