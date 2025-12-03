import { deobfuscateKorean, obfuscateKorean } from '../../utils/text';

export const normalizeAddress = (address: string): string => {
  if (!address) return '';

  const parts = address.trim().split(/\s+/);
  const dongPart = parts.find(part => part.endsWith('동'));

  return dongPart || '';
};

/**
 * transactionId에서 필요한 정보를 추출합니다
 * transactionId 형식: ${regionCode}__${obfuscateKorean(address)}__${obfuscateKorean(apartName)}__${size}__${floor}__${tradeDate}__${tradeAmount}
 */
export const parseTransactionId = (
  transactionId: string
): {
  regionCode: string;
  address: string;
  apartName: string;
  size: number;
  floor: number | null;
  tradeDate: string;
  tradeAmount: number;
  apartId: string;
} | null => {
  try {
    const parts = transactionId.split('__');
    if (parts.length !== 7) {
      console.error('Invalid transactionId format:', transactionId);
      return null;
    }

    const regionCode = parts[0];
    const address = deobfuscateKorean(parts[1]);
    const apartName = deobfuscateKorean(parts[2]);
    const size = parseFloat(parts[3]);
    const floor = parts[4] === 'null' ? null : parseInt(parts[4], 10);
    const tradeDate = parts[5];
    const tradeAmount = parseInt(parts[6], 10);

    const apartId = createApartId({ regionCode, address, apartName });

    return {
      regionCode,
      address,
      apartName,
      size,
      floor,
      tradeDate,
      tradeAmount,
      apartId,
    };
  } catch (error) {
    console.error('parseTransactionId 파싱 실패:', { transactionId, error });
    return null;
  }
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

export const createApartToken = (params: {
  regionCode: string;
  apartName: string;
  jibun: 'number';
}): string => {
  return `${params.regionCode}__${obfuscateKorean(params.apartName)}__${params.jibun}`;
};
