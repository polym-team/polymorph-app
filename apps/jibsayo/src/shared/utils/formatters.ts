export const removeSpecialCharacters = (str: string) => {
  return str.replace(/[^a-zA-Z0-9가-힣\s]/g, '');
};

export const formatNumberWithCommas = (number: number): string => {
  return number.toLocaleString();
};

export const formatDate = (dateString: string): string => {
  const [year, month, day] = dateString.split('-');
  const shortYear = year.slice(-2);

  return `${shortYear}.${month}.${day}`;
};

export const formatKoreanAmountText = (amount: number): string => {
  const eok = Math.floor(amount / 100000000);
  const man = Math.floor((amount % 100000000) / 10000);

  if (eok > 0 && man > 0) {
    return `${eok}억 ${man.toLocaleString()}만원`;
  } else if (eok > 0) {
    return `${eok}억원`;
  } else {
    return `${man.toLocaleString()}만원`;
  }
};

export const formatKoreanAmountSimpleText = (amount: number): string => {
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

export const formatQuantity = (quantity: number): string => {
  return `${quantity}건`;
};

export const formatFloor = (floor: number): string => {
  return `${floor}층`;
};

export const formatSize = (size: number): string => {
  return `${size}㎡`;
};

export const formatPyeong = (size: number): string => {
  return `${size}평`;
};
