import { obfuscateKorean } from '../utils/text';

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
