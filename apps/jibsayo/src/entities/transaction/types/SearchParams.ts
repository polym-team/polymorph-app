export interface SearchParams {
  regionCode: string;
  tradeDate: string;
  pageIndex: number;
  apartName: string;
  minSize: number;
  maxSize: number;
  favoriteOnly: boolean;
  newTransactionOnly: boolean;
}
