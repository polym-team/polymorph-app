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
    targetApartItem.apartName === compareApartItem.apartName &&
    targetApartItem.regionCode === compareApartItem.regionCode &&
    targetApartItem.address === compareApartItem.address
  );
};
