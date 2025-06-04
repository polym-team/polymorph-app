export const ROUTE_PATH = {
  TRANSACTIONS: '/transactions',
  FAVORITE_APARTS: '/favorite-aparts',
  APART: '/apart',
  APART_DETAIL: (apartName: string, regionCode?: string) => {
    const params = new URLSearchParams();
    params.set('apartName', apartName);
    if (regionCode) {
      params.set('regionCode', regionCode);
    }
    return `/apart?${params.toString()}`;
  },
} as const;
