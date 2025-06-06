export const formatPrice = (amount: number): string => {
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

export const formatSizeWithPyeong = (
  exclusiveAreaInSquareMeters: number
): string => {
  // 공급면적 = 전용면적 × 1.35 (일반적인 계수)
  const supplyArea = exclusiveAreaInSquareMeters * 1.35;
  const pyeong = Math.round(supplyArea / 3.3);
  return `${pyeong}평`;
};
