import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export const useSearchParamChange = (fn: () => void): void => {
  const searchParams = useSearchParams();
  const regionCode = searchParams.get('regionCode');
  const tradeDate = searchParams.get('tradeDate');

  useEffect(() => {
    if (regionCode && tradeDate) {
      fn();
    }
  }, [regionCode, tradeDate]);
};
