export const hasRequiredUrlParams = (): boolean => {
  if (typeof window === 'undefined') return false;

  const searchParams = new URLSearchParams(window.location.search);
  return !!(
    searchParams.get('regionCode') && searchParams.get('tradeDate')
  );
};
