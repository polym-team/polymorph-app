export interface CompareChartData {
  date: Date;
  apartId: number;
  apartName: string;
  averagePrice: number;
  count: number;
  color: string;
}

export interface ChartLegendItem {
  apartId: number;
  apartName: string;
  color: string;
  totalCount: number;
  averageAmount: number;
}

export type PeriodValue = 0 | 60 | 36 | 24 | 12;
