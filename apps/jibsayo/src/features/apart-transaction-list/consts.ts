export const PERIODS = [
  { value: 0, label: '전체' },
  { value: 60, label: '최근 5년' },
  { value: 36, label: '최근 3년' },
  { value: 24, label: '최근 2년' },
  { value: 12, label: '최근 1년' },
] as const;

export const CHART_COLORS = [
  '#1f77b4', // 파랑
  '#ff7f0e', // 주황
  '#2ca02c', // 초록
  '#d62728', // 빨강
  '#9467bd', // 보라
  '#8c564b', // 갈색
  '#e377c2', // 분홍
  '#7f7f7f', // 회색
  '#bcbd22', // 올리브
  '#17becf', // 청록
] as const;
