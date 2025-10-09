export const createApartItemKey = (params: {
  regionCode: string;
  address: string;
  apartName: string;
}) => {
  const replacedRegionCode = params.regionCode.replace(
    /[^a-zA-Z0-9가-힣]/g,
    ''
  );
  const replacedAddress = params.address.replace(/[^a-zA-Z0-9가-힣]/g, '');
  const replacedApartName = params.apartName.replace(/[^a-zA-Z0-9가-힣]/g, '');

  return `${replacedRegionCode}__${replacedAddress}__${replacedApartName}`;
};

export const calculateAreaPyeong = (
  exclusiveAreaInSquareMeters: number
): number => {
  const supplyArea = exclusiveAreaInSquareMeters * 1.35;
  return Math.round(supplyArea / 3.3);
};
