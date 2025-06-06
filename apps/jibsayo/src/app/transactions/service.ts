import { TransactionsResponse } from '../api/transactions/types';

export const getTransactions = async (
  regionCode: string,
  tradeDate: string
): Promise<TransactionsResponse | null> => {
  try {
    const response = await fetch(
      `${process.env.BASE_URL}/api/transactions?area=${regionCode}&createDt=${tradeDate}`
    );

    if (response.ok) {
      return response.json();
    }

    return null;
  } catch (error) {
    console.error('거래 데이터 조회 실패:', error);
    return null;
  }
};
