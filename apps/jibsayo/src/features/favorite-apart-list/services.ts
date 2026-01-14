import {
  ApartmentTransactionSummary,
  FavoriteApartItem,
} from '@/entities/apart';
import {
  getCityNameWithRegionCode,
  getRegionNameWithRegionCode,
} from '@/entities/region';

import { RegionItemViewModel } from './types';

export const convertToRegionItems = (
  favoriteApartList: FavoriteApartItem[],
  favoriteApartIdsSet: Set<number>,
  transactionsMap?: Map<number, ApartmentTransactionSummary>
): RegionItemViewModel[] => {
  const regionItems: RegionItemViewModel[] = [];
  const regionCodes = Array.from(
    new Set(favoriteApartList.map(item => item.regionCode))
  );

  regionCodes.forEach(regionCode => {
    const apartItems = favoriteApartList
      .filter(item => item.regionCode === regionCode)
      .map(item => {
        const transactionSummary = transactionsMap?.get(item.apartId);

        return {
          ...item,
          isFavorite: favoriteApartIdsSet.has(item.apartId),
          hasNewTransaction: transactionSummary?.hasNewTransaction ?? false,
          latestTransaction: transactionSummary?.latestTransaction ?? null,
          newTransaction: transactionSummary?.newTransaction ?? null,
          highestPriceTransaction:
            transactionSummary?.highestPriceTransaction ?? null,
          lowestPriceTransaction:
            transactionSummary?.lowestPriceTransaction ?? null,
        };
      });

    regionItems.push({
      code: regionCode,
      name: `${getCityNameWithRegionCode(regionCode)}${getRegionNameWithRegionCode(regionCode)}`,
      apartItems,
    });
  });

  const sortedRegionItems = regionItems.sort((a, b) => {
    return a.name.localeCompare(b.name, 'ko');
  });

  return sortedRegionItems;
};
