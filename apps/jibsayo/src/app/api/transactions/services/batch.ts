import { GovApiItem } from '../types';

// DB Row 타입 정의
export interface TransactionDbRow {
  region_code: string;
  apart_id: number | null;
  apart_name: string;
  deal_date: string;
  deal_amount: number;
  exclusive_area: number;
  floor: number | null;
  jibun: string;
  building_dong: string | null;
  estate_agent_region: string | null;
  registration_date: string | null;
  cancellation_type: 'NONE' | 'CANCELED';
  cancellation_date: string | null;
  deal_type: string | null;
  seller_type: string | null;
  buyer_type: string | null;
  is_land_lease: boolean;
}

// 거래일자 조합 (YYYY-MM-DD)
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

// 거래가격 계산 (만원 단위 -> 원 단위로 변환)
const calculateTradeAmount = (item: GovApiItem): number => {
  const dealAmountText = String(item.dealAmount || '')
    .replace(/,/g, '')
    .trim();
  return dealAmountText ? parseInt(dealAmountText, 10) * 10000 : 0;
};

// 전용면적 계산 (제곱미터)
const calculateSize = (item: GovApiItem): number => {
  const excluUseArText = String(item.excluUseAr || '').trim();
  return excluUseArText ? parseFloat(excluUseArText) : 0;
};

// 층 계산
const calculateFloor = (item: GovApiItem): number | null => {
  const floorText = String(item.floor || '').trim();
  return floorText ? parseInt(floorText, 10) : null;
};

// 날짜 변환: 'YYYY.MM.DD' -> 'YYYY-MM-DD' 또는 'YYYYMMDD' -> 'YYYY-MM-DD'
const parseGovDate = (dateStr?: string): string | null => {
  if (!dateStr) return null;
  const trimmed = String(dateStr).trim();
  if (!trimmed) return null;

  // 'YYYY.MM.DD' 형식
  if (trimmed.includes('.')) {
    return trimmed.replace(/\./g, '-');
  }

  // 'YYYYMMDD' 형식
  if (trimmed.length === 8) {
    return `${trimmed.substring(0, 4)}-${trimmed.substring(4, 6)}-${trimmed.substring(6, 8)}`;
  }

  return trimmed;
};

// 취소 유형 변환
const parseCancellationType = (cdealType?: string): 'NONE' | 'CANCELED' => {
  return String(cdealType || '').trim() === '해제' ? 'CANCELED' : 'NONE';
};

// GovApiItem을 DB Row로 변환
export const convertGovApiItemToDbRow = (
  item: GovApiItem,
  regionCode: string
): TransactionDbRow => {
  return {
    region_code: regionCode,
    apart_id: null,
    apart_name: String(item.aptNm || '').trim(),
    deal_date: calculateTradeDate(item),
    deal_amount: calculateTradeAmount(item),
    exclusive_area: calculateSize(item),
    floor: calculateFloor(item),
    jibun: String(item.jibun || '').trim(),
    building_dong: String(item.aptDong || '').trim() || null,
    estate_agent_region: String(item.estateAgentSggNm || '').trim() || null,
    registration_date: parseGovDate(item.rgstDate),
    cancellation_type: parseCancellationType(item.cdealType),
    cancellation_date: parseGovDate(item.cdealDay),
    deal_type: item.dealingGbn || null,
    seller_type: item.slerGbn || null,
    buyer_type: item.buyerGbn || null,
    is_land_lease: String(item.landLeaseholdGbn || '').trim() === '토지임대부',
  };
};
