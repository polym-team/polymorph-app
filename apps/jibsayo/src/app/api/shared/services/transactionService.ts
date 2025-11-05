import { obfuscateKorean } from '../utils/text';

export const normalizeAddress = (address: string): string => {
  if (!address) return '';

  const parts = address.trim().split(/\s+/);
  const dongPart = parts.find(part => part.endsWith('동'));

  return dongPart || '';
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
