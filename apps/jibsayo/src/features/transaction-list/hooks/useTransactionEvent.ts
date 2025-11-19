import {
  useAddFavoriteApartHandler,
  useRemoveFavoriteApartHandler,
} from '@/entities/apart';
import { useTransactionPageSearchParams } from '@/entities/transaction';
import { ROUTE_PATH } from '@/shared/consts/route';
import { useNavigate } from '@/shared/hooks/useNavigate';

import { TransactionDetailItem } from '../models/types';

interface Return {
  toggleFavorite: (item: TransactionDetailItem) => void;
  navigateToApartDetail: (item: TransactionDetailItem) => void;
}

export const useTransactionEvent = (): Return => {
  const { navigate } = useNavigate();
  const { searchParams } = useTransactionPageSearchParams();
  const removeFavoriteApart = useRemoveFavoriteApartHandler();
  const addFavoriteApart = useAddFavoriteApartHandler();

  const toggleFavorite = (item: TransactionDetailItem) => {
    const params = {
      apartId: item.apartId,
      apartName: item.apartName,
      address: item.address,
      regionCode: searchParams.regionCode,
    };

    if (item.isFavorite) {
      removeFavoriteApart(params);
    } else {
      addFavoriteApart(params);
    }
  };

  const navigateToApartDetail = (item: TransactionDetailItem) => {
    navigate(
      `${ROUTE_PATH.APART_DETAIL}?regionCode=${searchParams.regionCode}&apartName=${item.apartName}`
    );
  };

  return { toggleFavorite, navigateToApartDetail };
};
