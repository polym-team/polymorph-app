import { PERIODS } from './consts';

export type PeriodValue = (typeof PERIODS)[number]['value'];

export type SizesValue = [number, number][];
