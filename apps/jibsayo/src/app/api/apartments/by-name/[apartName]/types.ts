export interface ApartmentListItem {
  id: number;
  apartName: string;
  householdCount: number | null;
  completionYear: number;
  regionCode: string;
  dong: string;
}

export type ApartmentsByNameResponse = ApartmentListItem[];
