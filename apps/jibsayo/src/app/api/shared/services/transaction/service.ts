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
    const parts = transactionId.split('::');
    if (parts.length !== 2) {
      return null;
    }

    const transactionParts = parts[1].split('__');
    if (transactionParts.length !== 4) {
      return null;
    }

    const apartToken = parts[0];
    const size = parseFloat(transactionParts[0]);
    const floor = parseFloat(transactionParts[1]);
    const tradeDate = transactionParts[2];
    const tradeAmount = parseInt(transactionParts[3], 10);

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
  return `${params.apartToken}::${params.size}__${params.floor}__${params.tradeDate}__${params.tradeAmount}`;
};

export const createFallbackToken = (params: {
  regionCode: string;
  apartName: string;
}): string => {
  return `${params.regionCode}__${obfuscateKorean(params.apartName)}`;
};

export const parseFallbackToken = (
  token: string
): {
  regionCode: string;
  apartName: string;
} | null => {
  try {
    const parts = token.split('__');
    if (parts.length !== 3) {
      return null;
    }

    const regionCode = parts[0];
    const apartName = deobfuscateKorean(parts[1]);

    return { regionCode, apartName };
  } catch {
    return null;
  }
};
