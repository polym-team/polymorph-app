export interface SearchForm {
  cityName: string;
  regionCode: string;
  tradeDate: Date;
}

export interface FilterForm {
  apartName: string;
  minSize: number;
  maxSize: number;
  favoriteOnly: boolean;
  newTransactionOnly: boolean;
}
