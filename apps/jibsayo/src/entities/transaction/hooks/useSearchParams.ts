import { ROUTE_PATH } from '@/shared/consts/route';

import {
  useRouter as useNavigationRouter,
  useSearchParams as useNavigationSearchParams,
} from 'next/navigation';

interface SearchParams {
  regionCode: string | undefined;
  tradeDate: string | undefined;
  pageIndex: string | undefined;
}

interface Return {
  searchParams: SearchParams;
  setSearchParams: (params: Partial<SearchParams>) => void;
}

export const useSearchParams = (): Return => {
  const navigationSearchParams = useNavigationSearchParams();
  const router = useNavigationRouter();

  const regionCode = navigationSearchParams.get('regionCode') ?? undefined;
  const tradeDate = navigationSearchParams.get('tradeDate') ?? undefined;
  const pageIndex = navigationSearchParams.get('pageIndex') ?? undefined;
  const searchParams = { regionCode, tradeDate, pageIndex };

  const setSearchParams = (params: Partial<SearchParams>) => {
    const newSearchParams = new URLSearchParams(navigationSearchParams);
    Object.entries(params).forEach(([key, value]) => {
      newSearchParams.set(key, value);
    });
    router.push(`${ROUTE_PATH.TRANSACTIONS}?${newSearchParams.toString()}`);
  };

  return { searchParams, setSearchParams };
};
