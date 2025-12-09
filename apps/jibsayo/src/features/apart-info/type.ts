export interface ApartInfoType {
  apartName: string;
  regionCode: string;
  buildYear: number | null;
  dong: string | null;
  apartType: string | null;
  saleType: string | null;
  heatingType: string | null;
  buildedType: string | null;
  buildingCount: number | null;
  constructorCompany: string | null;
  developerCompany: string | null;
  householdCount: number | null;
  saleHouseholdCount: number | null;
  rentHouseholdCount: number | null;
  parkingCount: number | null;
  groundParkingCount: number | null;
  undergroundParkingCount: number | null;
  electronicParkingCount: number | null;
  maxFloor: number | null;
  amenities: string[] | null;
}

export interface FallbackApartInfoType {
  apartName: string;
  regionCode: string;
}
