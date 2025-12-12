export interface TransactionChartData {
  date: Date;
  averagePrice: number;
  count: number;
  size: number;
  sizes: [number, number];
  pyeong: number;
  color: string;
}

export interface ChartLegendItem {
  pyeong: number;
  color: string;
  sizes: number[];
}
