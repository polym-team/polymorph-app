import { firstRegionCode } from '@/entities/region';
import { SearchParams } from '@/entities/transaction';

export const getDefaultRegionCode = (searchParams: SearchParams): string => {
  if (searchParams.regionCode) {
    return searchParams.regionCode;
  }

  return firstRegionCode;
};

export const getDefaultDate = (searchParams: SearchParams): Date => {
  if (searchParams.tradeDate) {
    return new Date(
      Number(searchParams.tradeDate.slice(0, 4)),
      Number(searchParams.tradeDate.slice(4, 6)) - 1
    );
  }

  const today = new Date();
  const dayOfMonth = today.getDate();

  if (dayOfMonth < 10) {
    return new Date(today.getFullYear(), today.getMonth() - 1, 1);
  } else {
    return new Date(today.getFullYear(), today.getMonth(), 1);
  }
};
