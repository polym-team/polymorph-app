export interface TransactionChartData {
  date: Date;
  averagePrice: number;
  count: number;
  size: number;
  sizes?: number[];
  pyeong: number;
}

export interface ChartLegendItem {
  pyeong: number;
  color: string;
  sizes: number[];
}
