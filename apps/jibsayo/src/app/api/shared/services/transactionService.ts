import { obfuscateKorean } from '../utils/text';

export const createTransactionId = (params: {
  regionCode?: string;
  address?: string;
  apartName?: string;
  tradeDate?: string;
  size?: number | null;
  floor?: number | null;
  tradeAmount?: number;
}): string => {
  const safeRegionCode = params.regionCode || '';
  const safeAddress = params.address || '';
  const safeApartName = params.apartName || '';
  const safeTradeDate = params.tradeDate || '';
  const safeSize =
    params.size !== null && params.size !== undefined
      ? String(params.size)
      : '';
  const safeFloor =
    params.floor !== null && params.floor !== undefined
      ? String(params.floor)
      : '';
  const safeTradeAmount =
    params.tradeAmount !== undefined ? String(params.tradeAmount) : '';

  return `${obfuscateKorean(safeRegionCode)}__${obfuscateKorean(safeAddress)}__${obfuscateKorean(safeApartName)}__${safeTradeDate}__${safeSize}__${safeFloor}__${safeTradeAmount}`;
};

export const createApartId = (params: {
  regionCode?: string;
  address?: string;
  apartName?: string;
}): string => {
  const safeRegionCode = params.regionCode || '';
  const safeAddress = params.address || '';
  const safeApartName = params.apartName || '';

  return `${obfuscateKorean(safeRegionCode)}__${obfuscateKorean(safeAddress)}__${obfuscateKorean(safeApartName)}`;
};
