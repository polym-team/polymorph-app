export const calculateAreaPyeong = (
  exclusiveAreaInSquareMeters: number | null
): number => {
  if (!exclusiveAreaInSquareMeters) return 0;

  const exclusivePyeong = exclusiveAreaInSquareMeters * 0.3025;

  if (exclusivePyeong < 17) return Math.round(exclusivePyeong * 1.4);
  if (exclusivePyeong < 20) return Math.round(exclusivePyeong * 1.35);
  if (exclusivePyeong < 28) return Math.round(exclusivePyeong * 1.35);
  if (exclusivePyeong < 35) return Math.round(exclusivePyeong * 1.3);
  if (exclusivePyeong < 39) return Math.round(exclusivePyeong * 1.23);
  return Math.round(exclusivePyeong * 1.22);
};

export const calculateExclusiveAreaSquareMeters = (
  areaPyeong: number | null,
  boundary: 'min' | 'max'
): number => {
  if (!areaPyeong) return 0;

  let ratio: number;
  if (areaPyeong < 24) ratio = 1.4;
  else if (areaPyeong < 38) ratio = 1.35;
  else if (areaPyeong < 46) ratio = 1.3;
  else if (areaPyeong < 48) ratio = 1.23;
  else ratio = 1.22;

  const exclusivePyeong = areaPyeong / ratio;
  const exclusiveArea = exclusivePyeong / 0.3025;

  return boundary === 'min'
    ? Math.floor(exclusiveArea)
    : Math.ceil(exclusiveArea);
};
