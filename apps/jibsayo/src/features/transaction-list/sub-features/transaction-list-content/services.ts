import { formatNumber } from '@/shared/utils/formatter';

import { TransactionItemViewModel } from '../../types';

export const calculateTransactionDetailInfo = (
  item: TransactionItemViewModel
): string[] => {
  const info: string[] = [];

  if (item.householdCount) {
    info.push(`${formatNumber(item.householdCount)}세대`);
  }

  if (item.completionYear) {
    info.push(`${item.completionYear}년식`);
  }

  return info;
};
