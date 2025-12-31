import { SearchParams } from '../types';

export const hasRequiredUrlParams = (searchParams: SearchParams): boolean => {
  return !!searchParams.regionCode && !!searchParams.tradeDate;
};
