/**
 * 제곱미터를 평수로 변환
 * @param size 면적(㎡)
 * @returns 평수
 */
export function calculatePyeong(size: number): number {
  return Math.round((size * 1.35) / 3.3);
}

/**
 * 평당 가격 계산
 * @param tradeAmount 거래가격
 * @param size 면적(㎡)
 * @returns 평당 가격
 */
export function calculatePricePerPyeong(
  tradeAmount: number,
  size: number
): number {
  const pyeong = calculatePyeong(size);
  return Math.round(tradeAmount / pyeong);
}

/**
 * 가격 변동률 계산
 * @param currentPrice 현재 가격
 * @param previousPrice 이전 가격
 * @returns 변동률 (%)
 */
export function calculatePriceChangeRate(
  currentPrice: number,
  previousPrice: number
): number {
  return ((currentPrice - previousPrice) / previousPrice) * 100;
}

/**
 * 가격 변동 정보 계산
 * @param currentPricePerPyeong 현재 평당 가격
 * @param previousPricePerPyeong 이전 평당 가격
 * @param threshold 변동률 임계값 (기본 1%)
 * @returns 가격 변동 정보 또는 null
 */
export function calculatePriceChange(
  currentPricePerPyeong: number,
  previousPricePerPyeong: number
): {
  change: string;
  isUp: boolean;
  isDown: boolean;
} | null {
  const changeRate = calculatePriceChangeRate(
    currentPricePerPyeong,
    previousPricePerPyeong
  );

  return {
    change: changeRate.toFixed(2),
    isUp: changeRate > 0,
    isDown: changeRate < 0,
  };
}
