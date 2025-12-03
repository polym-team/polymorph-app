import {
  useAddFavoriteApartMutation,
  useRemoveFavoriteApartMutation,
} from '@/entities/apart';
import { useTransactionPageSearchParams } from '@/entities/transaction';
import { ROUTE_PATH } from '@/shared/consts/route';
import { useNavigate } from '@/shared/hooks/useNavigate';

import { TransactionItemViewModel } from '../types';

interface Return {
  toggleFavorite: (item: TransactionItemViewModel) => void;
  navigateToApartDetail: (item: TransactionItemViewModel) => void;
}

export const useTransactionHandler = (): Return => {
  const { navigate } = useNavigate();
  const { searchParams } = useTransactionPageSearchParams();
  const { mutate: mutateFavoriteApartRemove } =
    useRemoveFavoriteApartMutation();
  const { mutate: mutateFavoriteApartAdd } = useAddFavoriteApartMutation();

  const toggleFavorite = (item: TransactionItemViewModel) => {
    const params = {
      apartToken: item.apartToken,
      apartName: item.apartName,
      address: item.address,
      regionCode: searchParams.regionCode,
    };

    if (item.isFavorite) {
      mutateFavoriteApartRemove(params);
    } else {
      mutateFavoriteApartAdd(params);
    }
  };

  const navigateToApartDetail = (item: TransactionItemViewModel) => {
    navigate(`${ROUTE_PATH.APART}/${item.apartToken}`);
  };

  return { toggleFavorite, navigateToApartDetail };
};
