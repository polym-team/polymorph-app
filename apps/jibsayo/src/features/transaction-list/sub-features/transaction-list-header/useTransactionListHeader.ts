import {
  getCityNameWithRegionCode,
  getRegionNameWithRegionCode,
} from '@/entities/region';
import { useTransactionPageSearchParams } from '@/entities/transaction';

interface Return {
  cityName: string;
  regionName: string;
}

export const useTransactionListHeader = (): Return => {
  const { searchParams } = useTransactionPageSearchParams();

  const cityName = getCityNameWithRegionCode(searchParams.regionCode);
  const regionName = getRegionNameWithRegionCode(searchParams.regionCode);

  return { cityName, regionName };
};
