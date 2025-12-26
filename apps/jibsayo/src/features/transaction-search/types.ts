export interface SearchForm {
  cityName: string;
  regionCode: string;
  tradeDate: Date;
}

export interface FilterForm {
  apartName: string;
  minSize: number;
  maxSize: number;
  minDealAmount: number;
  maxDealAmount: number;
  minHouseholdCount: number;
  maxHouseholdCount: number;
  favoriteOnly: boolean;
  newTransactionOnly: boolean;
}
