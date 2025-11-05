import {
  createApartId,
  normalizeAddress,
} from '@/app/api/shared/services/transactionService';

import { GovApiItem, TransactionItem } from '../models/types';

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

// 평수 비교 (소수점 오차 고려)
const isSizeEqual = (size1: number, size2: number | null): boolean => {
  if (size2 === null) return size1 === 0;
  // 소수점 둘째 자리까지 비교 (0.01 제곱미터 오차 허용)
  return Math.abs(size1 - size2) < 0.01;
};

// 신규 거래 여부 확인 - 필드 직접 비교
const isNewTransaction = (
  address: string,
  apartName: string,
  tradeDate: string,
  floor: number | null,
  tradeAmount: number,
  size: number,
  newTransactions?: Array<{
    address: string;
    apartName: string;
    tradeDate: string;
    floor: number | null;
    tradeAmount: number;
    size: number | null;
  }>
): boolean => {
  if (!newTransactions || newTransactions.length === 0) {
    return false;
  }

  return newTransactions.some(
    newTransaction =>
      newTransaction.address.includes(address) &&
      newTransaction.apartName === apartName &&
      newTransaction.tradeDate === tradeDate &&
      newTransaction.floor === floor &&
      newTransaction.tradeAmount === tradeAmount &&
      isSizeEqual(size, newTransaction.size)
  );
};

const convertGovApiItemToTransaction = (
  item: GovApiItem,
  area: string,
  newTransactions?: Array<{
    address: string;
    apartName: string;
    tradeDate: string;
    floor: number | null;
    tradeAmount: number;
    size: number | null;
  }>
): TransactionItem => {
  const tradeDate = calculateTradeDate(item);
  const tradeAmount = calculateTradeAmount(item);
  const size = calculateSize(item);
  const floor = calculateFloor(item);
  const buildedYear = calculateBuildedYear(item);
  const address = calculateAddress(item);
  const apartName = String(item.aptNm || '').trim();

  const apartId = createApartId({
    regionCode: area,
    address,
    apartName,
  });

  const isNew = isNewTransaction(
    address,
    apartName,
    tradeDate,
    floor,
    tradeAmount,
    size,
    newTransactions
  );

  return {
    apartId,
    apartName,
    buildedYear,
    address,
    tradeDate,
    size,
    floor,
    tradeAmount,
    isNew,
  };
};

export const convertGovApiItemToTransactions = (
  items: GovApiItem[],
  area: string,
  newTransactions?: Array<{
    address: string;
    apartName: string;
    tradeDate: string;
    floor: number | null;
    tradeAmount: number;
    size: number | null;
  }>
) => {
  return items.map(item =>
    convertGovApiItemToTransaction(item, area, newTransactions)
  );
};
