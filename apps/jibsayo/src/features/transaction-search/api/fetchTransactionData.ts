export async function fetchTransactionData(
  regionCode: string,
  tradeDate: string
) {
  try {
    const response = await fetch(
      `http://localhost:3000/api/transactions?area=${regionCode}&createDt=${tradeDate}`,
      { cache: 'no-store' }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API 조회 실패:', error);
    return { count: 0, list: [] };
  }
}
