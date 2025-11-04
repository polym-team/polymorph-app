import {
  createApartId,
  createTransactionId,
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

// 주소 정규화 - new-transactions API와 동일한 형식으로 변환
// new-transactions API는 "서울특별시 강동구 강일동" 형식 (지번 없음)
// transactions API는 "서울 강동구 강일동 668" 형식 (지번 포함)
// 따라서 지번을 제거하고 "서울"을 "서울특별시"로 변경
const normalizeAddress = (address: string): string => {
  if (!address) return '';

  // "서울"을 "서울특별시"로 변경
  let normalized = address.replace(/^서울\s/, '서울특별시 ');

  // 지번 제거 (숫자 또는 숫자-숫자 형식의 지번 제거)
  // 예: "서울특별시 강동구 강일동 668" -> "서울특별시 강동구 강일동"
  // 예: "서울특별시 강동구 강일동 19-1" -> "서울특별시 강동구 강일동"
  normalized = normalized.replace(/\s+\d+(-\d+)?\s*$/, '');

  // 동 뒤에 붙은 숫자 제거 (예: "101동" -> "동"으로 남음)
  normalized = normalized.replace(/\s+\d+동\s*$/, '');

  return normalized.trim();
};

// 주소 조합 - 모든 필드를 문자열로 변환
const calculateAddress = (item: GovApiItem): string => {
  const sggNm = String(item.estateAgentSggNm || '').trim();
  const umdNm = String(item.umdNm || '').trim();
  const jibun = String(item.jibun || '').trim();
  const aptDong = String(item.aptDong || '').trim();

  // 주소 조합 (지번과 동 정보는 포함하지만, 정규화 시 제거됨)
  const address =
    `${sggNm} ${umdNm} ${jibun}${aptDong ? ' ' + aptDong + '동' : ''}`.trim();

  // 주소 정규화 (new-transactions API와 형식 통일: 지번 제거, "서울" -> "서울특별시")
  return normalizeAddress(address);
};

// 신규 거래 여부 확인
const isNewTransaction = (
  transactionId: string,
  newTransactionIds?: Set<string>
): boolean => {
  if (!newTransactionIds || newTransactionIds.size === 0) {
    return false;
  }

  return newTransactionIds.has(transactionId);
};

// 국토부 API 응답을 내부 형식으로 변환
export const convertGovApiItemToTransaction = (
  item: GovApiItem,
  area: string,
  newTransactionIds?: Set<string>
): TransactionItem => {
  const tradeDate = calculateTradeDate(item);
  const tradeAmount = calculateTradeAmount(item);
  const size = calculateSize(item);
  const floor = calculateFloor(item);
  const buildedYear = calculateBuildedYear(item);
  const address = calculateAddress(item);
  const apartName = String(item.aptNm || '').trim();

  const transactionId = createTransactionId({
    regionCode: area,
    address,
    apartName,
    tradeDate,
    size,
    floor,
    tradeAmount,
  });

  const apartId = createApartId({
    regionCode: area,
    address,
    apartName,
  });

  const isNew = isNewTransaction(transactionId, newTransactionIds);

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
