export const formatToAmount = (amountText: string): number => {
  let amount: number = 0;
  let restText: string = amountText;

  if (amountText.includes('억')) {
    amount += Number(amountText.split('억')[0]) * 100_000_000;
    restText = amountText.split('억')[1];
  }

  if (amountText.includes('천')) {
    amount += Number(restText.split('천')[0]) * 10_000_000;
    restText = restText.split('천')[1];
  }

  if (restText) {
    amount += Number(restText) * 10_000;
  }

  return amount;
};
