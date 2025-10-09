import { removeSpecialCharacters } from '../utils/formatters';

export const isSameApartItem = (
  targetApartItem: {
    apartName: string;
    regionCode: string;
    address: string;
  },
  compareApartItem: {
    apartName: string;
    regionCode: string;
    address: string;
  }
) => {
  return (
    removeSpecialCharacters(targetApartItem.apartName) ===
      removeSpecialCharacters(compareApartItem.apartName) &&
    removeSpecialCharacters(targetApartItem.regionCode) ===
      removeSpecialCharacters(compareApartItem.regionCode) &&
    removeSpecialCharacters(targetApartItem.address) ===
      removeSpecialCharacters(compareApartItem.address)
  );
};
