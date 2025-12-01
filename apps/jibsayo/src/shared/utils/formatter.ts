export const formatNumber = (number: number): string => {
  return number.toLocaleString();
};

export const formatTransactionDate = (dateString: string): string => {
  const [year, month, day] = dateString.split('-');
  const shortYear = year.slice(-2);

  return `${shortYear}.${month}.${day}`;
};

export const formatKoreanAmountText = (amount: number): string => {
  const truncatedAmount = Math.floor(amount / 1000000) * 1000000;

  const eok = Math.floor(truncatedAmount / 100000000); // 억
  const man = Math.floor((truncatedAmount % 100000000) / 10000); // 만

  if (eok > 0 && man > 0) {
    const eokWithDecimal = eok + man / 10000;
    return `${parseFloat(eokWithDecimal.toFixed(2))}억원`;
  } else if (eok > 0) {
    return `${eok}억원`;
  } else {
    return `${man.toLocaleString()}만원`;
  }
};

export const formatPercentText = (percent: number): string => {
  return `${percent}%`;
};

export const formatQuantityText = (quantity: number): string => {
  return `${quantity}건`;
};

export const formatFloorText = (floor: number): string => {
  return `${floor}층`;
};

export const formatSizeText = (size: number): string => {
  return `${size}㎡`;
};

export const formatPyeongText = (size: number): string => {
  return `${size}평`;
};
