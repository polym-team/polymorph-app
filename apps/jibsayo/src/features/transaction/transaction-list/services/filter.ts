import { RULES, SearchParams, TransactionItem } from '@/entities/transaction';
import { calculateAreaPyeong } from '@/shared/services/transactionCalculator';

const filterTransactionItemWithApartName = (
  transaction: TransactionItem,
  apartName: SearchParams['apartName']
) => {
  if (!apartName) {
    return true;
  }
  return transaction.apartName.toLowerCase().includes(apartName.toLowerCase());
};

const filterTransactionItemWithSize = (
  transaction: TransactionItem,
  minSize: SearchParams['minSize'],
  maxSize: SearchParams['maxSize']
) => {
  if (
    !minSize ||
    !maxSize ||
    (minSize === RULES.SEARCH_MIN_SIZE && maxSize === RULES.SEARCH_MAX_SIZE)
  ) {
    return true;
  }
  const pyeong = calculateAreaPyeong(transaction.size);
  return pyeong >= minSize && pyeong <= maxSize;
};

const filterTransactionItemWithFavorite = (
  transaction: TransactionItem,
  favoriteOnly: SearchParams['favoriteOnly']
) => {
  if (!favoriteOnly) {
    return true;
  }
  return false; // FIXME: 수정 필요
};

const filterTransactionItemWithNewTransaction = (
  transaction: TransactionItem,
  newTransactionOnly: SearchParams['newTransactionOnly']
) => {
  if (!newTransactionOnly) {
    return true;
  }
  return false; // FIXME: 수정 필요
};

export const filterTransactionListWithFilter = (
  data: TransactionItem[],
  filter: {
    apartName: SearchParams['apartName'];
    minSize: SearchParams['minSize'];
    maxSize: SearchParams['maxSize'];
    favoriteOnly: SearchParams['favoriteOnly'];
    newTransactionOnly: SearchParams['newTransactionOnly'];
  }
): TransactionItem[] => {
  return data.filter(
    transaction =>
      filterTransactionItemWithApartName(transaction, filter.apartName) &&
      filterTransactionItemWithSize(
        transaction,
        filter.minSize,
        filter.maxSize
      ) &&
      filterTransactionItemWithFavorite(transaction, filter.favoriteOnly) &&
      filterTransactionItemWithNewTransaction(
        transaction,
        filter.newTransactionOnly
      )
  );
};
