import { obfuscateKorean } from '../utils/text';

export const normalizeAddress = (address: string): string => {
  if (!address) return '';

  const parts = address.trim().split(/\s+/);
  const dongPart = parts.find(part => part.endsWith('동'));

  return dongPart || '';
};

export const createTransactionId = (params: {
  regionCode?: string;
  address?: string;
  apartName?: string;
  size?: number | null;
  floor?: number | null;
  tradeDate?: string;
  tradeAmount?: number;
}): string => {
  const safeRegionCode = params.regionCode || '';
  const safeAddress = params.address || '';
  const safeApartName = params.apartName || '';
  const safeSize = params.size || 0;
  const safeFloor = params.floor || null;
  const safeTradeDate = params.tradeDate || '';
  const safeTradeAmount = params.tradeAmount || 0;

  return `${safeRegionCode}__${obfuscateKorean(safeAddress)}__${obfuscateKorean(safeApartName)}__${safeSize}__${safeFloor}__${safeTradeDate}__${safeTradeAmount}`;
};

export const createApartId = (params: {
  regionCode?: string;
  address?: string;
  apartName?: string;
}): string => {
  const safeRegionCode = params.regionCode || '';
  const safeAddress = params.address || '';
  const safeApartName = params.apartName || '';

  return `${safeRegionCode}__${obfuscateKorean(safeAddress)}__${obfuscateKorean(safeApartName)}`;
};
