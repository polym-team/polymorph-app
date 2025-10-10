import codes from '../models/codes.json';
import { RegionItem } from '../models/types';

export const cityNameList: string[] = codes.map(item => item.name);
export const regionList: RegionItem[] = codes.reduce(
  (acc, item) => [...acc, ...item.children],
  [] as RegionItem[]
);
export const firstRegionCode: string = codes[0].children[0].code;

export const getRegionsWithCityName = (cityName: string): RegionItem[] =>
  codes.find(item => item.name === cityName)?.children ?? [];

export const getCityNameWithRegionCode = (regionCode: string): string =>
  codes.find(item => item.children.some(child => child.code === regionCode))
    ?.name ?? '';

export const getRegionNameWithRegionCode = (regionCode: string): string =>
  codes
    .reduce((acc, item) => [...acc, ...item.children], [] as RegionItem[])
    .find(item => item.code === regionCode)?.name ?? '';
