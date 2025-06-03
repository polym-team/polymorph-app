export const parseTradeDate = (tradeDate: string): Date => {
  const year = parseInt(tradeDate.substring(0, 4), 10);
  const month = parseInt(tradeDate.substring(4, 6), 10) - 1;
  return new Date(year, month);
};
