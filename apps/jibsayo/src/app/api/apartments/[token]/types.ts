export interface ApartByIdResponse {
  regionCode: string;
  apartName: string;
  buildYear: number;
  dong: string;
  apartType: string | null;
  saleType: string | null;
  heatingType: string | null;
  buildedType: string | null;
  buildingCount: number | null;
  constructorCompany: string | null;
  developerCompany: string | null;
  saleHouseholdCount: number | null;
  householdCount: number | null;
  rentHouseholdCount: number | null;
  parkingCount: number | null;
  groundParkingCount: number | null;
  undergroundParkingCount: number | null;
  electronicParkingCount: number | null;
  maxFloor: number | null;
  amenities: string[] | null;
}
