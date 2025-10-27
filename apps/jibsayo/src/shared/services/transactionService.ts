export const createApartItemKey = (params: {
  regionCode?: string;
  address?: string;
  apartName?: string;
}) => {
  const safeRegionCode = params.regionCode || '';
  const safeAddress = params.address || '';
  const safeApartName = params.apartName || '';

  const replacedRegionCode = safeRegionCode.replace(
    /[^a-zA-Z0-9가-힣]/g,
    ''
  );
  const replacedAddress = safeAddress.replace(/[^a-zA-Z0-9가-힣]/g, '');
  const replacedApartName = safeApartName.replace(/[^a-zA-Z0-9가-힣]/g, '');

  return `${replacedRegionCode}__${replacedAddress}__${replacedApartName}`;
};

export const calculateAreaPyeong = (
  exclusiveAreaInSquareMeters: number
): number => {
  const supplyArea = exclusiveAreaInSquareMeters * 1.35;
  return Math.round(supplyArea / 3.3);
};
