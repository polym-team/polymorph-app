import { deobfuscateKorean, obfuscateKorean } from '../../utils/text';

export const normalizeAddress = (address: string): string => {
  if (!address) return '';

  const parts = address.trim().split(/\s+/);
  const dongPart = parts.find(part => part.endsWith('동'));

  return dongPart || '';
};

export const parseTransactionId = (
  transactionId: string
): {
  apartToken: string;
  size: number;
  floor: number;
  tradeDate: string;
  tradeAmount: number;
} | null => {
  try {
    const parts = transactionId.split('__');
    if (parts.length !== 7) {
      console.error('Invalid transactionId format:', transactionId);
      return null;
    }

    const apartToken = parts[0];
    const size = parseFloat(parts[1]);
    const floor = parseFloat(parts[2]);
    const tradeDate = parts[3];
    const tradeAmount = parseInt(parts[4], 10);

    return {
      apartToken,
      size,
      floor,
      tradeDate,
      tradeAmount,
    };
  } catch (error) {
    console.error('parseTransactionId 파싱 실패:', { transactionId, error });
    return null;
  }
};

export const createTransactionId = (params: {
  apartToken: string;
  size: number;
  floor: number;
  tradeDate: string;
  tradeAmount: number;
}): string => {
  return `${params.apartToken}__${params.size}__${params.floor}__${params.tradeDate}__${params.tradeAmount}`;
};

export const createApartToken = (params: {
  regionCode: string;
  apartName: string;
  jibun: string;
}): string => {
  return `${params.regionCode}__${obfuscateKorean(params.apartName)}__${params.jibun}`;
};

export const parseApartToken = (
  token: string
): {
  regionCode: string;
  apartName: string;
  jibun: string;
} | null => {
  try {
    const parts = token.split('__');
    if (parts.length !== 3) {
      return null;
    }

    const regionCode = parts[0];
    const apartName = deobfuscateKorean(parts[1]);
    const jibun = parts[2];

    return { regionCode, apartName, jibun };
  } catch {
    return null;
  }
};
