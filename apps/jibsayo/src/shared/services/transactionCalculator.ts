export const calculateAreaPyeong = (
  exclusiveAreaInSquareMeters: number
): number => {
  const supplyArea = exclusiveAreaInSquareMeters * 1.35;
  return Math.round(supplyArea / 3.3);
};
