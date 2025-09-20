export const formatKoreanAmountText = (amount: number): string => {
  const eok = Math.floor(amount / 100000000);
  const man = Math.floor((amount % 100000000) / 10000);

  if (eok > 0 && man > 0) {
    return `${eok}억 ${man.toLocaleString()}만원`;
  } else if (eok > 0) {
    return `${eok}억원`;
  } else {
    return `${man.toLocaleString()}만원`;
  }
};

export const formatKoreanAmountSimpleText = (amount: number): string => {
  const truncatedAmount = Math.floor(amount / 1000000) * 1000000;

  const eok = Math.floor(truncatedAmount / 100000000); // 억
  const man = Math.floor((truncatedAmount % 100000000) / 10000); // 만

  if (eok > 0 && man > 0) {
    const eokWithDecimal = eok + man / 10000;
    return `${parseFloat(eokWithDecimal.toFixed(2))}억원`;
  } else if (eok > 0) {
    return `${eok}억원`;
  } else {
    return `${man.toLocaleString()}만원`;
  }
};

export const formatFloor = (floor: number): string => {
  return `${floor}층`;
};

export const formatSizeWithPyeong = (
  exclusiveAreaInSquareMeters: number
): string => {
  const supplyArea = exclusiveAreaInSquareMeters * 1.35;
  const pyeong = Math.round(supplyArea / 3.3);

  return `${pyeong}평`;
};
