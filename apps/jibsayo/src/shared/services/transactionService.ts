export const calculateAreaPyeong = (
  exclusiveAreaInSquareMeters: number | null
): number => {
  if (!exclusiveAreaInSquareMeters) return 0;

  const supplyArea = exclusiveAreaInSquareMeters * 1.35;
  return Math.round(supplyArea / 3.3);
};
