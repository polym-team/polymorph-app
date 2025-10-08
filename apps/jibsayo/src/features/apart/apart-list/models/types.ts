export interface ApartItem {
  name: string;
  address: string;
}

export interface RegionItem {
  code: string;
  name: string;
  apartItems: ApartItem[];
}
